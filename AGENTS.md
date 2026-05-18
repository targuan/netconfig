# Agent Instructions for NetConfig Manager POC

Welcome! This document provides key information and instructions for working on the NetConfig Manager POC project.

## Project Overview
A full-stack network configuration management Proof of Concept using:
- **Backend**: Python/Django, Django REST Framework (DRF), Django Channels (with Daphne & Redis).
- **Frontend**: Angular (v21+), Angular Material.

## Repository Structure
- `backend/`: Django application.
- `frontend/`: Angular application.

## Key Backend Information
- **Database**: All models (Device, DeviceConfig, Task) must use UUIDs as primary keys.
- **WebSocket Server**: Uses Daphne as the ASGI server. `ASGI_APPLICATION` is set in `network_manager/settings.py`.
- **Dependencies**: `pip install -r backend/requirements.txt`.
- **Testing**: Run tests with `python backend/manage.py test`.
- **Network Driver**: Uses a `FakeNAPALMDriver` in `backend/core/services/network/driver.py` for simulation.
- **Task Workflow**: pending_approval -> approved -> queued -> running -> success/failed.

## Key Frontend Information
- **Coding Convention**: All components MUST use separate `.html` and `.scss` files. Inline templates/styles are prohibited.
- **UI Library**: Angular Material. standalone components are preferred.
- **Dependencies**: `npm install` inside the `frontend/` directory.
- **Build/Dev Commands**: `npm run build` or `npm run start`.
- **Testing**: Run tests with `npm run test -- --watch=false`.
- **Real-time Updates**: Managed via `WebSocketService` for task logs and `ChatService` for the global chat component.

## WebSocket Routes
- `ws/tasks/`: Global task list updates.
- `ws/tasks/{task_id}/`: Specific task log streaming.
- `ws/chat/{room_name}/`: Multi-room chat (general, tasks, devices, configurations).

## Pre-submission Checklist
1. Ensure all backend tests pass.
2. Ensure frontend build completes without errors.
3. Verify any UI changes with screenshots (Playwright recommended).
4. Do not commit log files (`*.log`) or build artifacts.
