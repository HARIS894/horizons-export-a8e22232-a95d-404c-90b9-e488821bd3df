# InstantCare Meta Flows

## Flow Architecture

This package defines a modular WhatsApp Flows architecture for InstantCare Healthcare using endpoint-powered Flow JSON.

- `instantcare-main-menu.json`: enterprise dispatcher flow for first-contact triage.
- `healthcare.json`: general healthcare service discovery and intake.
- `booking.json`: full appointment and care booking flow.
- `eldercare.json`: senior and dependent care intake.
- `doctor.json`: doctor visit and teleconsultation scheduling.
- `healthcheckup.json`: preventive and diagnostic package selection.
- `emergency.json`: urgent response and escalation intake.
- `coordinator.json`: care coordinator engagement flow.
- `equipment.json`: medical equipment rental and delivery flow.
- `nri.json`: NRI family healthcare management enrollment.
- `faq.json`: self-service knowledge and escalation flow.

Each flow uses:

- Flow JSON version `6.2`
- `data_api_version` `3.0`
- explicit `routing_model`
- unique screen IDs per file
- summary, success, failure, and confirmation states
- backend-powered `data_exchange` actions for dynamic routing and validation

## Screen Hierarchy

### Main Menu

- `MAIN_MENU`
- `MAIN_MENU_SUMMARY`
- `MAIN_MENU_SUCCESS`
- `MAIN_MENU_FAILURE`

### Booking

- `BOOKING_INTRO`
- `BOOKING_PATIENT`
- `BOOKING_CONTACT`
- `BOOKING_CARE`
- `BOOKING_SCHEDULE`
- `BOOKING_SUMMARY`
- `BOOKING_LOADING`
- `BOOKING_SUCCESS`
- `BOOKING_FAILURE`

### General Healthcare

- `HEALTHCARE_INTRO`
- `HEALTHCARE_SERVICE`
- `HEALTHCARE_DETAILS`
- `HEALTHCARE_SUMMARY`
- `HEALTHCARE_SUCCESS`
- `HEALTHCARE_FAILURE`

### Specialized Flows

- Elder care, doctor, health checkup, emergency, coordinator, equipment, NRI, and FAQ each follow intake -> details -> summary -> success/failure progression.

## Backend API Contracts

All flows are intended to use the WhatsApp Flows Data Endpoint with `data_exchange` payloads containing a `flow_action` discriminator.

### Core Endpoint

- `POST /api/v1/flows/meta`

### Required Request Envelope

```json
{
  "version": "3.0",
  "user_locale": "en_IN",
  "action": "data_exchange",
  "screen": "BOOKING_SCHEDULE",
  "flow_token": "meta-flow-token",
  "data": {
    "flow_action": "booking_fetch_slots",
    "preferred_date": "2026-08-10",
    "required_service": "home_nursing",
    "city": "Chennai",
    "pin_code": "600001"
  }
}
```

### Supported `flow_action` Values

- `resolve_main_menu`
- `submit_main_menu_request`
- `healthcare_prepare_summary`
- `submit_healthcare_request`
- `booking_fetch_slots`
- `booking_prepare_summary`
- `submit_booking_request`
- `refresh_booking_status`
- `eldercare_prepare_summary`
- `submit_eldercare_request`
- `doctor_fetch_slots`
- `doctor_prepare_summary`
- `submit_doctor_request`
- `healthcheckup_prepare_summary`
- `submit_healthcheckup_request`
- `emergency_prepare_summary`
- `submit_emergency_request`
- `coordinator_prepare_summary`
- `submit_coordinator_request`
- `equipment_prepare_summary`
- `submit_equipment_request`
- `nri_prepare_summary`
- `submit_nri_request`
- `faq_fetch_answer`
- `faq_escalate_request`

### Response Schema

```json
{
  "version": "3.0",
  "screen": "BOOKING_SUMMARY",
  "data": {
    "summary_markdown": "# Booking Summary\n- Service: Home Nursing\n- Patient: Arun Kumar",
    "available_slots": [
      { "id": "09:00", "title": "09:00 AM", "description": "Morning visit", "metadata": "IST", "enabled": true }
    ],
    "is_slot_visible": true,
    "booking_request_id": "BK-20260807-001",
    "status_message": "Request received"
  }
}
```

## Webhook Payload Example

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "4715540018732690",
      "changes": [
        {
          "field": "messages",
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15556704770",
              "phone_number_id": "1207888922415231"
            },
            "messages": [
              {
                "from": "919999999999",
                "id": "wamid.HBgM...",
                "timestamp": "1786102030",
                "type": "interactive",
                "interactive": {
                  "type": "nfm_reply",
                  "nfm_reply": {
                    "name": "flow",
                    "response_json": {
                      "flow_name": "booking",
                      "booking_request_id": "BK-20260807-001",
                      "patient_name": "Arun Kumar",
                      "required_service": "home_nursing",
                      "preferred_date": "2026-08-10",
                      "preferred_time": "09:00"
                    }
                  }
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

## Supabase Table Mapping

### `notifications`

- `channel`: `whatsapp`
- `status`: `queued | sent | delivered | read | failed`
- `subject`: flow-level business subject
- `message`: final rendered completion message
- `external_reference`: Meta flow token or booking request id
- `metadata`: flow name, screen path, service line, escalation policy

### `whatsapp_logs`

- `whatsapp_type`: `flow-intake`, `flow-summary`, `flow-complete`, `inbound-reply`
- `template_name`: source flow file name
- `webhook_payload`: original interactive payload
- `provider_response`: Meta send or delivery response
- `sent_at`, `delivered_at`, `read_at`: transport lifecycle

### Recommended New Tables

- `flow_sessions`
- `flow_booking_requests`
- `flow_document_uploads`
- `flow_callback_requests`
- `flow_service_catalog_cache`
- `flow_slot_cache`

## Node.js Endpoint Requirements

- Validate Meta signature and flow token.
- Decrypt and parse Flow data requests when required by Meta Flow transport.
- Route by `flow_action`.
- Return screen-specific data contracts with `version`, `screen`, and `data`.
- Persist partial state by `flow_token` and `phone_number`.
- Generate secure document upload sessions for prescription and report collection.
- Support idempotent completion handling.
- Emit audit logs for every `data_exchange` and completion event.
- Apply rate limits and abuse detection for emergency and callback flows.

## Validation Rules

- `patient_name`: required, 2-80 chars, letters plus spaces.
- `age`: required, 0-120.
- `gender`: required enum.
- `pin_code`: required, 6 digits for India.
- `mobile_number`: required, E.164 or 10-digit Indian number normalized server-side.
- `alternative_number`: optional, same mobile validation.
- `preferred_date`: required, today or later unless emergency.
- `preferred_time`: required once slots are loaded.
- `payment_mode`: required enum.
- `special_instructions`: max 600 chars.
- `document_reference` fields: optional unless user marks document available; must match backend-issued upload token format.

## Upload Pattern

This package uses a secure upload-session model rather than embedding document binaries into the Flow completion payload.

- backend issues upload session reference
- user uploads through secure InstantCare document endpoint
- flow collects upload reference token
- backend resolves token to encrypted storage object in Supabase storage or PHI-safe document store

## Future AI Chatbot Integration Points

- service recommendation after symptom/context capture
- FAQ semantic search fallback
- booking summary natural-language explanation
- escalation risk scoring for emergency flows

## Future Voice Agent Integration

- voice-to-flow handoff with prefilled patient context
- callback scheduling from failed voice intents
- multilingual IVR to WhatsApp continuation

## Future OpenAI Integration

- care summary generation
- follow-up question generation for incomplete booking payloads
- clinical intake normalization for coordinator dashboards

## Future Appointment Engine Integration

- real-time slots by city, clinician, and service line
- blackout dates and staffing thresholds
- home-visit capacity routing

## Future CRM Integration

- lead scoring
- source attribution
- coordinator ownership
- SLA timers and conversion analytics

## Future Payment Gateway Integration

- pre-authorization for urgent services
- package checkout links
- UPI and card collections

## Future Notification Integration

- coordinator alerts
- internal operations queue
- NRI family updates
- pre-visit reminders and completion notices

## Future Dashboard And Admin Panel Integration

- flow funnel analytics
- slot utilization
- abandonment reasons
- emergency response SLA board
- document verification queue
- care coordinator assignment console
