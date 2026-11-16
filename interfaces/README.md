# Federated Event Contract v1

The ScrollVerse Platform exposes the canonical event-envelope contract used by independent repository and service consumers.

- JSON Schema: `federation-event.v1.schema.json`
- TypeScript/Zod validator: `../shared/federation/event.v1.ts`
- Conformance tests: `../shared/federation/event.v1.test.ts`

## Delivery rules

- Validate the schema before queueing or routing an event.
- Authenticate the producer independently; a valid envelope is not proof of authorization.
- Enforce classification and consumer allowlists before delivery.
- Use `event_id` as the idempotency key and `correlation_id` to trace a workflow.
- Preserve provenance with source reference, commit SHA and optional SHA-256 content hash.
- Reject unknown major versions; allow additive minor-version evolution.
- Treat payloads as untrusted data. Never accept private keys, recovery phrases, credentials, raw payment data or unredacted customer secrets.
- Keep consumers read-only by default. Changes are proposals routed to a pull request in the owning repository.

## Security boundary

This package validates shape only. Transport authentication, signatures, replay prevention, idempotency storage, authorization, retention enforcement and audit logging must be implemented by the service adapter before production use. No event endpoint or production connection is enabled by this PR.
