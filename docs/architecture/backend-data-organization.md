# Backend Data Organization Proposal

## 1. Organization Strategy

Use MySQL 8.x with logical database separation by business domain:

1. `park_config_db`
- Park-related information and operation parameters

2. `account_db`
- Customer/admin account and authentication data

3. `commerce_db`
- Orders, tickets, payment, verification records

4. (optional) `analytics_db`
- Aggregated/reporting data (read-optimized)

If operations prefer simpler deployment, keep one database and use table-prefix split:

- `park_cfg_*`, `account_*`, `commerce_*`, `analytics_*`

## 2. Cross-Database Key Conventions

- Use UUID for all primary keys.
- Use `park_id` (tenant key) in all park-operational tables.
- Use `datetime(3)` for all `*_at` fields and store UTC values only.
- Add `created_at`, `updated_at` to business tables.
- Add soft-delete fields where needed: `is_deleted`, `deleted_at`.
- Use MySQL `json` for structured payload snapshots/config fields.
- Use `decimal(12,2)` or `decimal(14,2)` for money values.

## 3. `park_config_db` (Park info and parameters)

### 3.1 `parks`

- `park_id` (PK, UUID)
- `park_code` (UNIQUE, varchar)
- `park_name` (varchar)
- `status` (enum: active/inactive)
- `timezone` (varchar)
- `currency` (varchar)
- `created_at` (datetime(3))
- `updated_at` (datetime(3))

### 3.2 `park_profiles`

- `profile_id` (PK, UUID)
- `park_id` (FK -> parks.park_id)
- `intro_text` (text)
- `hero_image_url` (text)
- `open_date_start` (date)
- `open_date_end` (date)
- `updated_by_admin_id` (UUID)
- `updated_at` (datetime(3))

### 3.3 `park_schedules`

- `schedule_id` (PK, UUID)
- `park_id` (FK)
- `effective_date` (date)
- `entry_time_start` (time)
- `entry_time_end` (time)
- `is_closed` (boolean)
- `notes` (varchar)
- `created_at` (datetime(3))

### 3.4 `park_booking_settings`

- `setting_id` (PK, UUID)
- `park_id` (FK)
- `booking_window_days` (int)  -- e.g. 7/14/30
- `max_tickets_per_order` (int)
- `allow_guest_purchase` (boolean)
- `created_at` (datetime(3))
- `updated_at` (datetime(3))

### 3.5 `park_payment_settings`

- `payment_setting_id` (PK, UUID)
- `park_id` (FK)
- `enable_credit_card` (boolean)
- `enable_line_pay` (boolean)
- `provider_config_json` (json)
- `updated_at` (datetime(3))

### 3.6 `ticket_types`

- `ticket_type_id` (PK, UUID)
- `park_id` (FK)
- `ticket_name` (varchar) -- flexible naming
- `description` (text)
- `price_amount` (numeric(12,2))
- `is_verification_required` (boolean)
- `is_active` (boolean)
- `sale_start_date` (date)
- `sale_end_date` (date)
- `visit_start_date` (date)
- `visit_end_date` (date)
- `created_at` (datetime(3))
- `updated_at` (datetime(3))

### 3.7 `ticket_sales_limits`

- `limit_id` (PK, UUID)
- `ticket_type_id` (FK)
- `park_id` (FK)
- `daily_cap_enabled` (boolean)
- `daily_cap_qty` (int)
- `period_cap_enabled` (boolean)
- `period_cap_start_date` (date)
- `period_cap_end_date` (date)
- `period_cap_qty` (int)
- `updated_at` (datetime(3))

### 3.8 `ticket_sales_counters`

- `counter_id` (PK, UUID)
- `park_id` (FK)
- `ticket_type_id` (FK)
- `visit_date` (date)
- `sold_qty_daily` (int)
- `sold_qty_period` (int)
- `remaining_qty_effective` (int)
- `updated_at` (datetime(3))

Index suggestions:

- `(park_id, ticket_type_id, visit_date)` unique
- `(park_id, visit_date)`

## 4. `account_db` (Customer/admin accounts)

### 4.1 `users`

- `user_id` (PK, UUID)
- `account_type` (enum: phone/email)
- `phone_e164` (varchar, nullable, unique partial)
- `email` (varchar, nullable, unique partial)
- `display_name` (varchar)
- `status` (enum: active/locked/deactivated)
- `last_login_at` (datetime(3))
- `created_at` (datetime(3))
- `updated_at` (datetime(3))

### 4.2 `user_credentials`

- `credential_id` (PK, UUID)
- `user_id` (FK -> users.user_id)
- `password_hash` (varchar)
- `password_algo` (varchar)
- `password_updated_at` (datetime(3))
- `failed_attempts` (int)
- `locked_until` (datetime(3))

### 4.3 `auth_sessions`

- `session_id` (PK, UUID)
- `user_id` (FK)
- `session_token_hash` (varchar)
- `refresh_token_hash` (varchar)
- `ip_address` (varchar)
- `user_agent` (text)
- `issued_at` (datetime(3))
- `expires_at` (datetime(3))
- `revoked_at` (datetime(3), nullable)

### 4.4 `verification_codes`

- `verification_id` (PK, UUID)
- `channel` (enum: sms/email)
- `target` (varchar) -- phone or email
- `purpose` (enum: register/reset_password/change_password/login)
- `code_hash` (varchar)
- `expires_at` (datetime(3))
- `used_at` (datetime(3), nullable)
- `request_ip` (varchar)
- `created_at` (datetime(3))

### 4.5 `user_park_access`

- `user_park_access_id` (PK, UUID)
- `user_id` (FK)
- `park_id` (UUID)
- `first_purchase_at` (datetime(3))
- `last_purchase_at` (datetime(3))

### 4.6 `admin_users`

- `admin_id` (PK, UUID)
- `login_name` (varchar, unique)
- `password_hash` (varchar)
- `display_name` (varchar)
- `status` (enum: active/inactive)
- `created_at` (datetime(3))

### 4.7 `admin_roles`

- `role_id` (PK, UUID)
- `role_name` (varchar)
- `permissions_json` (json)
- `created_at` (datetime(3))

### 4.8 `admin_role_bindings`

- `binding_id` (PK, UUID)
- `admin_id` (FK)
- `role_id` (FK)
- `park_id` (UUID, nullable) -- null for global role

### 4.9 `admin_audit_logs`

- `audit_id` (PK, UUID)
- `admin_id` (FK)
- `park_id` (UUID, nullable)
- `action_type` (varchar)
- `target_entity` (varchar)
- `target_id` (UUID)
- `before_json` (json)
- `after_json` (json)
- `created_at` (datetime(3))

## 5. `commerce_db` (Orders, tickets, verification)

### 5.1 `orders`

- `order_id` (PK, UUID)
- `park_id` (UUID)
- `user_id` (UUID, nullable) -- null for guest
- `order_no` (varchar, unique)
- `order_source` (enum: registered/guest)
- `order_status` (enum: pending_payment/paid/failed/canceled/refunded)
- `visit_date` (date)
- `entry_time_start` (time)
- `entry_time_end` (time)
- `total_amount` (numeric(12,2))
- `currency` (varchar)
- `created_at` (datetime(3))
- `paid_at` (datetime(3), nullable)
- `canceled_at` (datetime(3), nullable)

### 5.2 `order_items`

- `order_item_id` (PK, UUID)
- `order_id` (FK -> orders.order_id)
- `ticket_type_id` (UUID)
- `ticket_name_snapshot` (varchar)
- `unit_price_snapshot` (numeric(12,2))
- `qty` (int)
- `requires_verification` (boolean)
- `verification_status` (enum: not_required/pending/passed/failed)

### 5.3 `payments`

- `payment_id` (PK, UUID)
- `order_id` (FK)
- `park_id` (UUID)
- `method` (enum: credit_card/line_pay)
- `provider_txn_id` (varchar)
- `payment_status` (enum: initiated/success/failed/timeout/refund)
- `amount` (numeric(12,2))
- `paid_at` (datetime(3), nullable)
- `raw_payload_json` (json)

### 5.4 `tickets`

- `ticket_id` (PK, UUID)
- `park_id` (UUID)
- `order_id` (FK)
- `order_item_id` (FK)
- `user_id` (UUID, nullable)
- `ticket_no` (varchar, unique)
- `ticket_status` (enum: unused/used/expired/canceled)
- `valid_from` (datetime(3))
- `valid_to` (datetime(3))
- `used_at` (datetime(3), nullable)
- `created_at` (datetime(3))

### 5.5 `ticket_qr_codes`

- `qr_id` (PK, UUID)
- `ticket_id` (FK)
- `park_id` (UUID)
- `qr_payload` (text)
- `qr_hash` (varchar)
- `issued_at` (datetime(3))
- `expires_at` (datetime(3))
- `is_active` (boolean)

### 5.6 `ticket_usage_logs`

- `usage_log_id` (PK, UUID)
- `ticket_id` (FK)
- `park_id` (UUID)
- `usage_status` (enum: success/failed)
- `usage_reason` (varchar)
- `used_at` (datetime(3))

### 5.7 `id_verification_requests`

- `request_id` (PK, UUID)
- `park_id` (UUID)
- `order_id` (UUID)
- `order_item_id` (UUID)
- `user_id` (UUID, nullable)
- `upload_channel` (enum: camera/file)
- `image_url` (text)
- `request_status` (enum: pending/completed/failed)
- `requested_at` (datetime(3))

### 5.8 `id_verification_results`

- `result_id` (PK, UUID)
- `request_id` (FK)
- `park_id` (UUID)
- `result_status` (enum: pass/fail)
- `reason_codes_json` (json)
- `ocr_summary_json` (json)
- `decided_at` (datetime(3))

### 5.9 `inventory_reservations`

- `reservation_id` (PK, UUID)
- `park_id` (UUID)
- `ticket_type_id` (UUID)
- `visit_date` (date)
- `order_id` (UUID)
- `reserved_qty` (int)
- `reservation_status` (enum: active/released/consumed)
- `expires_at` (datetime(3))
- `created_at` (datetime(3))

Purpose:

- Prevent oversell in payment pending state.
- Release reservation automatically on payment timeout/failure.

## 6. `analytics_db` (optional)

### 6.1 `fact_ticket_sales_daily`

- `metric_date` (date)
- `park_id` (UUID)
- `ticket_type_id` (UUID)
- `paid_order_count` (int)
- `ticket_qty_sold` (int)
- `gmv_amount` (numeric(14,2))
- `updated_at` (datetime(3))

### 6.2 `fact_verification_daily`

- `metric_date` (date)
- `park_id` (UUID)
- `verification_required_count` (int)
- `verification_pass_count` (int)
- `verification_fail_count` (int)
- `updated_at` (datetime(3))

### 6.3 `fact_entry_daily`

- `metric_date` (date)
- `park_id` (UUID)
- `used_ticket_count` (int)
- `entry_success_rate` (numeric(5,2))
- `updated_at` (datetime(3))

## 7. Minimal Index and Constraint Checklist

- Unique keys: `order_no`, `ticket_no`, `park_code`, admin `login_name`.
- Tenant indexes on all park-scoped tables: `(park_id, created_at)`.
- Foreign keys from child rows to parent business entities.
- Check constraints for status enums and positive quantities/amounts.
- Transaction boundary on order-payment-inventory update path.

## 8. Retention Suggestions

- `verification_codes`: short retention (e.g., 30-90 days).
- `auth_sessions`: retention by security policy.
- `id_verification_*`: retention based on legal/compliance rule.
- `orders/tickets/payments`: long-term for accounting and audit.
- `analytics_*`: rolling retention by reporting needs.
