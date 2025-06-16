# Synthetic Website Template

This repository provides a template for creating self-hosted, synthetic websites for the "Build, Vibe, Ship!" sprint. The template includes a Next.js frontend and a Python FastAPI backend, orchestrated via Docker Compose.

The goal of this sprint is to showcase your skills by building a real, functional synthetic website that logs all actions made on the website. You should choose a real-world application/website that you think would be interesting to mock. To give you some examples (with real-world similar sites):
* E-commerce Platform (Amazon, Shopify)
* Travel & Booking Platform (Expedia, Booking.com)
* Project Management / Task Tracking Platform (Asana, Trello)
* Customer Relationship Management Platform (Salesforce, Zendesk)
* Social media Platform (Reddit, Discourse)
* News/Media Platform (CNN, NYT)
* Online Learning / eLearning Platform (Coursera, Khan Academy)
* Job Boards / Career Site (LinkedIn, Indeed)
* Messaging/Chat Platform (Slack, Discord)
* Finance / Budgeting / Banking (Mint, Stripe Dashboard)
* Healthcare Portal (MyChart, Zocdoc)
* Real Estate Listings (Zillow, Redfin)
* Forums / Communities (Stack Overflow, Discourse)
* Event Management / Ticketing (Eventbrite, Meetup)

Feel free to choose the website you want to build — the above are just ideas!

Submissions will be graded on:
* Feature depth
* Functionality (no bugs, etc.)
* Design sense
* Adherence to the specs described below

**Feature depth is key** — the more feature complete the application, the better your submission will be scored!

---

## 1. Getting Started

### Prerequisites
*   Docker and Docker Compose installed
*   (Optional but Recommended for API interaction examples) `jq` for pretty-printing JSON

### Installation & Launch
First, clone this repository:
```bash
git clone <repository-url> # Replace <repository-url> with the actual URL
cd <repository-name>
```
To build and start the services:
```bash
docker-compose up --build
```

The frontend will be available at `http://localhost:3000`, and the backend API will be available at `http://localhost:8000`.

---

## 2. How to Use: Core `/_synthetic/*` API

This section details how to interact with the core `/_synthetic/*` API endpoints provided by the backend for controlling and observing the synthetic environment.

### API Interaction Prerequisites
*   The synthetic website must be running
*   `curl` is used for examples, but `jq` is recommended for readable JSON output

### Key API Endpoints

#### 1. Initialize a New Session

This endpoint starts a new session, resets state and logs, and provides a `session_id`.

```bash
# Request a new session (optionally with a seed)
curl -s -X POST \
  "http://localhost:8000/_synthetic/new_session?seed=123" \
| jq
```

**Example Output**:
```json
{
  "session_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```
*(A `Set-Cookie: session_id=...` header will also be returned)*

#### 2. Log a Custom Event

This endpoint allows the client-side application to send structured log data to the backend. The `session_id` must be passed as a query parameter.

```bash
# Set your session ID (replace with the actual ID from new_session)
export SESSION_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Example: Log a custom click event
curl -s -X POST \
  "http://localhost:8000/_synthetic/log_event?session_id=$SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "user_click",
    "payload": {
      "text": "User clicked the create note button",
      "page_url": "http://localhost:3000/notes",
      "target_element_identifier": "[data-testid=\'create-note-btn\']",
      "custom_property": "custom_value"
    }
  }' \
| jq
```
**Example Output**:
```json
{
  "status": "logged"
}
```

#### 3. Get Logs for a Session

Retrieve logs for a given `session_id`.

```bash
# Set your session ID (replace with the actual ID from new_session)
export SESSION_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Read logs for that session
curl -s \
  "http://localhost:8000/_synthetic/logs?session_id=$SESSION_ID" \
| jq
```

**Example Output (after some interactions)**:
```json
[
  {
    "session_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "timestamp": 1678886401.123,
    "action_type": "DB_UPDATE",
    "payload": {
      "table_name": "users",
      "update_type": "insert",
      "text": "User testuser created in database with id 1, username testuser",
      "values": {
        "id": 1,
        "username": "testuser",
        "created_at": "2024-03-14T12:00:00",
        "updated_at": null
      }
    }
  },
  {
    "session_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "timestamp": 1678886405.456,
    "action_type": "CUSTOM",
    "payload": {
      "custom_action": "login",
      "text": "User testuser logged in",
      "data": {
        "userId": 1
      }
    }
  }
]
```

#### 4. Reset Environment

Resets the backend state and clears logs. Optionally accepts a seed.

```bash
# The session_id cookie might be relevant if parts of your reset logic
# are session-dependent, but typically not for a full environment reset.
curl -s -X POST \
  "http://localhost:8000/_synthetic/reset?seed=42" \
  -H "Cookie: session_id=$SESSION_ID" \
| jq
```

**Example Output**:
```json
{
  "status": "ok",
  "seed": "42"
}
```

## 3. Building Your Own Synthetic Website from this Template

### Overview
This template provides a starting point. You will need to modify and extend it to create a synthetic environment tailored to your specific application and tasks. The general workflow involves customizing the frontend UI, defining backend logic and state, and implementing task-specific verification.

### Backend

The backend provides the following modules/services:

#### Database

The database is found in `backend/app/db`. You should update the `models.py` file with any relevant new data models that you need to serve the core application.

You also need to implement the `populate_database` function in `db.py` to fill your application with mock data. This can be generated using a library like Faker with a preset seed, or generated manually.

#### Mock data and workflows

Since we are building mock websites, avoid using any real data in the creation of the websites. Instead,
websites should be pre-populated with a rich and diverse set of realistic mock data relevant to the domain (e.g., products, articles, user profiles, messages). Ensure that you do not include any PII of real people in the websites you build — **this will result in the submission failing**.

In order to accomplish this you may either seed the database with mock data you create, or use libraries like Faker to generate mock data with a predetermined seed (this template shows an example of this).

For websites involving real-world processes like purchases, bookings, or submissions, implement a fully sandboxed flow. This includes relevant forms, mock validation, and simulated success/failure responses — no actual external transactions or connections to real third-party services are permitted. All mocks must run locally within the containerized environment.

If the website domain involves user accounts, it must simulate common authentication mechanisms (e.g., username/password login, session cookies). Mocked multi-factor authentication or OAuth2-like flows (e.g., "Sign in with MockService") may be included if relevant.

#### Routes

The application routes (synthetic and example application endpoints) are found in the `routes` folder. The synthetic routes in `routes/synthetic.py` should not need to be updated. Feel free to edit the routes in `notes.py` and create any additional routes as needed to build the backend.

#### Logging events

One of the core facets of the project is logs that can be used to verify agent behavior. The following events are available for you to log:

1. **HTTP Request** (`HTTP_REQUEST`)
   ```json
   {
     "text": "Natural language description of the request",
     "method": "HTTP method (GET, POST, etc.)",
     "url": "Request URL",
     "query_params": {"param": "value"},
     "request_body": {"key": "value"},
     "status_code": 200,
     "response_time": 0.123
   }
   ```

2. **Database Update** (`DB_UPDATE`)
   ```json
   {
     "text": "Natural language description of the update",
     "table_name": "name_of_table",
     "update_type": "insert|update|delete",
     "values": {"column": "value"}
   }
   ```

3. **Click** (`CLICK`)
   ```json
   {
     "text": "Natural language description of the click",
     "page_url": "URL where click occurred",
     "element_identifier": "CSS selector or data-testid",
     "coordinates": {"x": 100, "y": 200}
   }
   ```

4. **Scroll** (`SCROLL`)
   ```json
   {
     "text": "Natural language description of the scroll",
     "page_url": "URL where scroll occurred",
     "scroll_x": 100,
     "scroll_y": 200
   }
   ```

5. **Hover** (`HOVER`)
   ```json
   {
     "text": "Natural language description of the hover",
     "page_url": "URL where hover occurred",
     "element_identifier": "CSS selector or data-testid"
   }
   ```

6. **Key Press** (`KEY_PRESS`)
   ```json
   {
     "text": "Natural language description of the key press",
     "page_url": "URL where key press occurred",
     "element_identifier": "CSS selector or data-testid",
     "key": "pressed key"
   }
   ```

7. **Navigation** (`GO_BACK`, `GO_FORWARD`, `GO_TO_URL`)
   ```json
   {
     "text": "Natural language description of the navigation",
     "page_url": "Current URL",
     "target_url": "Destination URL (for GO_TO_URL only)"
   }
   ```

8. **Storage** (`SET_STORAGE`)
   ```json
   {
     "text": "Natural language description of the storage action",
     "page_url": "URL where storage was modified",
     "storage_type": "local|session",
     "key": "storage key",
     "value": "storage value"
   }
   ```

9. **Custom** (`CUSTOM`)
   ```json
   {
     "text": "Natural language description of the custom action",
     "custom_action": "name_of_custom_action",
     "data": {"any": "custom data"}
   }
   ```

Of the above, you should not need to create any `HTTP_REQUEST` events. They're created in the log middleware in the backend.
* `DB_UPDATE` events should be created and logged in the backend when inserts/updates/deletes are made to the db
* All other event types should be sent from the frontend 

Each event type requires a natural language description in the `text` field to provide context about what happened. The payload structure varies by event type, but all events include this descriptive text field. Examples of these descriptions can be found in the template code. Make sure you fill in relevant variables (e.g., with an f-string) so that the natural language description contains all the information needed to know what the log represents.

### Frontend

The frontend is built in Next.js. Feel free to add components, pages, services, etc. as you see fit. You should use the `analyticsLogger` service to log events to the backend (action types defined above). 

### Documentation
Document your new website's features, common workflows, and any new API endpoints you add beyond the standard `/_synthetic/*` ones in either this `README.md` file or a separate file.

### Automated Tests
Make sure to add tests (e.g., using Playwright, Cypress for frontend/E2E, or PyTest for backend) to verify your applications core functionality — unit tests are required, but other tests (e.g., integration, end-to-end tests) are optional.