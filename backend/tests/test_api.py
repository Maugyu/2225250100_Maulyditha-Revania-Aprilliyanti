import uuid

from tests.conftest import login

API = "/api/v1"


def _uid() -> str:
    return str(uuid.uuid4())


def test_health(client):
    assert client.get(f"{API}/health").json()["status"] == "ok"


def test_login_success_and_me(client):
    h = login(client)
    me = client.get(f"{API}/auth/me", headers=h).json()
    assert me == {"username": "UJI-01", "role": "student", "class_code": "UJI"}


def test_login_wrong_pin_generic_message(client):
    r = client.post(f"{API}/auth/login", json={"username": "UJI-01", "pin": "000000"})
    assert r.status_code == 401
    assert r.json()["error"]["code"] == "INVALID_CREDENTIALS"
    r2 = client.post(f"{API}/auth/login", json={"username": "TIDAK-ADA", "pin": "000000"})
    assert r2.json()["error"]["message"] == r.json()["error"]["message"]


def test_login_rate_limited_after_five_failures(client):
    for _ in range(5):
        client.post(f"{API}/auth/login", json={"username": "UJI-02", "pin": "000000"})
    r = client.post(f"{API}/auth/login", json={"username": "UJI-02", "pin": "111222"})
    assert r.status_code == 429


def test_requires_token(client):
    r = client.get(f"{API}/modules")
    assert r.status_code == 401
    assert r.json()["error"]["code"] == "UNAUTHORIZED"


def test_validation_error_format(client):
    r = client.post(f"{API}/auth/login", json={"username": "UJI-01", "pin": "1", "x": 1})
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "VALIDATION_ERROR"


def test_module_and_activity(client):
    h = login(client)
    m = client.get(f"{API}/modules/pgl", headers=h).json()
    assert len(m["units"]) == 7
    assert any(g["key"] == "gradien" for g in m["glossary"])
    act_id = m["units"][2]["activities"][0]["id"]
    act = client.get(f"{API}/activities/{act_id}", headers=h).json()
    assert act["content"]["steps"][0]["type"] == "info"
    assert act["current_attempt"] is None


def _first_activity(client, h):
    m = client.get(f"{API}/modules/pgl", headers=h).json()
    return client.get(f"{API}/activities/{m['units'][1]['activities'][0]['id']}", headers=h).json()


def test_attempt_flow_idempotent_and_progress(client):
    h = login(client)
    act = _first_activity(client, h)
    cid = _uid()
    body = {"client_id": cid, "activity_id": act["id"], "content_version": act["content_version"]}
    assert client.post(f"{API}/attempts", json=body, headers=h).status_code == 201
    again = client.post(f"{API}/attempts", json=body, headers=h)
    assert again.json()["client_id"] == cid

    rid = _uid()
    resp = {"client_id": rid, "step_key": "tabel", "step_type": "numeric", "try_number": 1,
            "response": {"value": "15"}, "is_correct": False, "feedback_code": "ARITH",
            "hint_level_max": 1}
    assert client.post(f"{API}/attempts/{cid}/responses", json=resp, headers=h).status_code == 201
    # pengiriman ulang (offline) tidak menggandakan data
    assert client.post(f"{API}/attempts/{cid}/responses", json=resp, headers=h).status_code == 201

    resume = client.get(f"{API}/me/resume", headers=h).json()
    assert resume["activity_id"] == act["id"] and resume["step_key"] == "tabel"

    client.patch(f"{API}/attempts/{cid}", json={"status": "completed"}, headers=h)
    prog = client.get(f"{API}/me/progress", headers=h).json()
    u1 = next(u for u in prog["units"] if u["slug"] == "u1-tabel-grafik")
    assert u1["status"] == "in_progress"  # masih ada aktivitas lain di U1


def test_cannot_touch_other_students_attempt(client):
    h1 = login(client, "UJI-01")
    act = _first_activity(client, h1)
    cid = _uid()
    client.post(f"{API}/attempts", json={"client_id": cid, "activity_id": act["id"],
                                         "content_version": "x"}, headers=h1)
    h2 = login(client, "UJI-02")
    r = client.patch(f"{API}/attempts/{cid}", json={"last_step_key": "plot"}, headers=h2)
    assert r.status_code == 404


def test_unknown_step_key_rejected(client):
    h = login(client)
    act = _first_activity(client, h)
    cid = _uid()
    client.post(f"{API}/attempts", json={"client_id": cid, "activity_id": act["id"],
                                         "content_version": "x"}, headers=h)
    r = client.post(f"{API}/attempts/{cid}/responses", headers=h, json={
        "client_id": _uid(), "step_key": "tidak-ada", "step_type": "numeric", "try_number": 1,
        "response": {}})
    assert r.status_code == 422


def test_reflection(client):
    h = login(client)
    body = {"client_id": _uid(), "unit_slug": "u2-gradien", "prompt_key": "jelaskan-u2",
            "explanation": "Karena m negatif", "confidence": 3}
    assert client.post(f"{API}/reflections", json=body, headers=h).status_code == 201
    bad = {"client_id": _uid(), "unit_slug": "u2-gradien", "prompt_key": "x", "confidence": 9}
    assert client.post(f"{API}/reflections", json=bad, headers=h).status_code == 422


def test_student_forbidden_from_researcher(client):
    h = login(client)
    assert client.get(f"{API}/researcher/classes", headers=h).status_code == 403


def _contains_key(obj, key) -> bool:
    if isinstance(obj, dict):
        return key in obj or any(_contains_key(v, key) for v in obj.values())
    if isinstance(obj, list):
        return any(_contains_key(v, key) for v in obj)
    return False


def test_assessment_flow_hides_key_and_scores(client):
    hr = login(client, "PENELITI-UJI")
    hs = login(client, "UJI-01")
    lst = client.get(f"{API}/me/assessments", headers=hs).json()
    pre = next(a for a in lst if a["kind"] == "pre")
    assert pre["is_open"] is False
    assert client.post(f"{API}/assessments/{pre['id']}/submissions", headers=hs).status_code == 403

    client.patch(f"{API}/researcher/classes/UJI/assessments/{pre['id']}", json={"is_open": True}, headers=hr)
    sub = client.post(f"{API}/assessments/{pre['id']}/submissions", headers=hs).json()
    assert not _contains_key(sub, "answer_key")
    item = sub["items"][0]
    resp = {"tandai": {"selected": ["s1", "s2"]},
            "variabel": {"x": "banyak voucer", "y": "total kuota (GB)"},
            "model": {"m": "3", "c": "2"}, "hitung": {"value": "-14"}}
    r = client.put(f"{API}/submissions/{sub['id']}/responses/{item['id']}", json={"response": resp}, headers=hs)
    assert r.status_code == 200
    assert client.post(f"{API}/submissions/{sub['id']}/submit", headers=hs).status_code == 200
    r = client.put(f"{API}/submissions/{sub['id']}/responses/{item['id']}", json={"response": {}}, headers=hs)
    assert r.json()["error"]["code"] == "ASSESSMENT_ALREADY_SUBMITTED"

    csv_text = client.get(f"{API}/researcher/export/assessment_responses.csv?class_code=UJI", headers=hr).text
    assert '"F1"": 3' in csv_text and '"F3"": 3' in csv_text and '"E2"": 2' in csv_text

    queue = client.get(f"{API}/researcher/scoring/queue", headers=hr).json()
    assert queue and queue[0]["username"] is None
    r = client.put(f"{API}/researcher/scoring/{queue[0]['item_response_id']}", headers=hr,
                   json={"scores": [{"indicator": "I1", "score": 2, "note": "tanpa satuan"}]})
    assert r.status_code == 200


def test_csv_formula_injection_escaped(client):
    hs = login(client)
    body = {"client_id": _uid(), "unit_slug": "u1-tabel-grafik", "prompt_key": "jelaskan-u1",
            "explanation": "=HYPERLINK(\"x\")", "confidence": 2}
    client.post(f"{API}/reflections", json=body, headers=hs)
    hr = login(client, "PENELITI-UJI")
    text = client.get(f"{API}/researcher/export/reflections.csv?class_code=UJI", headers=hr).text
    assert "'=HYPERLINK" in text
