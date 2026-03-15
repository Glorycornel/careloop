def auth_headers(access_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {access_token}"}


def create_user_and_login(client, email: str = "user@example.com", password: str = "secret123"):
    register_response = client.post(
        "/auth/register",
        json={
            "full_name": "Test User",
            "email": email,
            "password": password,
        },
    )
    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={"email": email, "password": password},
    )
    assert login_response.status_code == 200
    body = login_response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["refresh_token"]
    return body


def test_auth_refresh_and_logout_e2e(client):
    tokens = create_user_and_login(client)

    me_response = client.get("/auth/me", headers=auth_headers(tokens["access_token"]))
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "user@example.com"

    refresh_response = client.post(
        "/auth/refresh",
        json={"refresh_token": tokens["refresh_token"]},
    )
    assert refresh_response.status_code == 200
    refreshed_tokens = refresh_response.json()
    assert refreshed_tokens["access_token"] != tokens["access_token"]
    assert refreshed_tokens["refresh_token"] != tokens["refresh_token"]

    reuse_old_refresh_response = client.post(
        "/auth/refresh",
        json={"refresh_token": tokens["refresh_token"]},
    )
    assert reuse_old_refresh_response.status_code == 401

    refreshed_me_response = client.get(
        "/auth/me",
        headers=auth_headers(refreshed_tokens["access_token"]),
    )
    assert refreshed_me_response.status_code == 200
    assert refreshed_me_response.json()["email"] == "user@example.com"

    logout_response = client.post(
        "/auth/logout",
        json={"refresh_token": refreshed_tokens["refresh_token"]},
    )
    assert logout_response.status_code == 204

    refresh_after_logout_response = client.post(
        "/auth/refresh",
        json={"refresh_token": refreshed_tokens["refresh_token"]},
    )
    assert refresh_after_logout_response.status_code == 401


def test_habit_crud_and_completion_e2e(client):
    tokens = create_user_and_login(client, email="habits@example.com")
    headers = auth_headers(tokens["access_token"])

    create_response = client.post(
        "/habits",
        headers=headers,
        json={
            "title": "Drink Water",
            "description": "8 glasses",
            "category": "build",
            "frequency_type": "daily",
            "active_days": "mon,tue,wed,thu,fri,sat,sun",
            "daily_target": 8,
            "icon": "W",
            "is_active": True,
        },
    )
    assert create_response.status_code == 201
    created_habit = create_response.json()
    habit_id = created_habit["id"]
    assert created_habit["title"] == "Drink Water"

    list_response = client.get("/habits", headers=headers)
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    today_response = client.get("/habits/today", headers=headers)
    assert today_response.status_code == 200
    today_habits = today_response.json()
    assert len(today_habits) == 1
    assert today_habits[0]["completed_today"] is False
    assert today_habits[0]["streak"] == 0

    complete_response = client.post(f"/habits/{habit_id}/complete", headers=headers)
    assert complete_response.status_code == 200
    assert complete_response.json()["habit_id"] == habit_id
    assert complete_response.json()["streak"] == 1

    today_after_complete_response = client.get("/habits/today", headers=headers)
    assert today_after_complete_response.status_code == 200
    today_after_complete = today_after_complete_response.json()
    assert today_after_complete[0]["completed_today"] is True
    assert today_after_complete[0]["streak"] == 1

    update_response = client.patch(
        f"/habits/{habit_id}",
        headers=headers,
        json={"title": "Drink More Water", "daily_target": 10},
    )
    assert update_response.status_code == 200
    assert update_response.json()["title"] == "Drink More Water"
    assert update_response.json()["daily_target"] == 10

    get_response = client.get(f"/habits/{habit_id}", headers=headers)
    assert get_response.status_code == 200
    assert get_response.json()["title"] == "Drink More Water"

    delete_response = client.delete(f"/habits/{habit_id}", headers=headers)
    assert delete_response.status_code == 204

    list_after_delete_response = client.get("/habits", headers=headers)
    assert list_after_delete_response.status_code == 200
    assert list_after_delete_response.json() == []


def test_refresh_token_cannot_be_used_as_bearer_token(client):
    tokens = create_user_and_login(client, email="bearer@example.com")

    response = client.get("/auth/me", headers=auth_headers(tokens["refresh_token"]))
    assert response.status_code == 401
