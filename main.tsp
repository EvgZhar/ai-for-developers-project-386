import "@typespec/http";
import "@typespec/openapi";
import "@typespec/openapi3";

using TypeSpec.Http;

@service(#{
  title: "Calendar Booking API",
})
@server("http://localhost:3000", "Development server")
namespace CalendarBooking;

// ===================== ENUMS =====================

enum ProfileType {
  admin,
  guest,
}

enum BookingStatus {
  requested,
  confirmed,
  rejected,
  cancelled,
}

// ===================== MODELS =====================

@doc("User profile for selecting a role on the start page")
model Profile {
  @doc("Unique identifier")
  id: string;

  @doc("Display name")
  name: string;

  @doc("Profile role")
  type: ProfileType;

  @doc("Locale code (e.g. en-US, ru-RU)")
  locale: string;

  @doc("IANA timezone (e.g. Europe/Moscow, America/New_York)")
  timeZone: string;
}

@doc("Working time interval within a single day, in owner's local timezone")
model TimeInterval {
  @doc("Start time in HH:mm format (owner's timezone)")
  @pattern("^([01]\\d|2[0-3]):[0-5]\\d$")
  startTime: string;

  @doc("End time in HH:mm format (owner's timezone)")
  @pattern("^([01]\\d|2[0-3]):[0-5]\\d$")
  endTime: string;
}

@doc("Working schedule for a specific day of the week")
model DaySchedule {
  @doc("Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday")
  @minValue(0)
  @maxValue(6)
  dayOfWeek: int32;

  @doc("Non-overlapping working intervals for this day")
  intervals: TimeInterval[];
}

@doc("Weekly working schedule for the calendar owner")
model Schedule {
  @doc("IANA timezone for all intervals")
  timeZone: string;

  @doc("Schedule for each day of the week")
  days: DaySchedule[];
}

@doc("Type of event that a guest can book")
model EventType {
  @doc("Unique identifier")
  id: string;

  @doc("Event title")
  title: string;

  @doc("Event description shown to guests")
  description: string;

  @doc("Duration in minutes")
  @minValue(15)
  durationMinutes: int32;

  @doc("Whether this event type is available for booking")
  isActive: boolean;
}

@doc("Available time slot for booking (computed on the fly)")
model AvailableSlot {
  @doc("Slot start datetime in UTC")
  startDateTime: utcDateTime;

  @doc("Slot end datetime in UTC")
  endDateTime: utcDateTime;
}

@doc("A confirmed booking (meeting)")
model Booking {
  @doc("Unique identifier")
  id: string;

  @doc("ID of the booked event type")
  eventTypeId: string;

  @doc("Meeting start datetime in UTC")
  startDateTime: utcDateTime;

  @doc("Meeting end datetime in UTC (start + event type duration)")
  endDateTime: utcDateTime;

  @doc("Optional meeting agenda or notes")
  agenda?: string;

  @doc("ID of the guest profile who booked")
  guestProfileId: string;

  @doc("Display name of the guest")
  guestName: string;

  @doc("Booking lifecycle status")
  status: BookingStatus;

  @doc("Booking creation timestamp in UTC")
  createdAt: utcDateTime;

  @doc("Cancellation timestamp in UTC")
  cancelledAt?: utcDateTime;
}

// ===================== CREATE / UPDATE MODELS =====================

@doc("Request to create a new guest profile")
model ProfileCreate {
  @doc("Display name")
  name: string;

  @doc("Locale code (e.g. en-US, ru-RU)")
  locale: string;

  @doc("IANA timezone (e.g. Europe/Moscow)")
  timeZone: string;
}

@doc("Request to create a new event type")
model EventTypeCreate {
  @doc("Event title")
  title: string;

  @doc("Event description shown to guests")
  description: string;

  @doc("Duration in minutes (min 15)")
  @minValue(15)
  durationMinutes: int32;
}

@doc("Request to update an existing event type")
model EventTypeUpdate {
  @doc("Event title")
  title?: string;

  @doc("Event description shown to guests")
  description?: string;

  @doc("Duration in minutes (min 15)")
  @minValue(15)
  durationMinutes?: int32;

  @doc("Whether this event type is available for booking")
  isActive?: boolean;
}

@doc("Request to create a new booking")
model BookingCreate {
  @doc("ID of the event type to book")
  eventTypeId: string;

  @doc("Desired start datetime in UTC")
  startDateTime: utcDateTime;

  @doc("Optional meeting agenda or notes")
  agenda?: string;

  @doc("ID of the guest profile making the booking")
  guestProfileId: string;
}

// ===================== ERROR MODELS =====================

@doc("Generic error response")
model ErrorResponse {
  code: string;
  message: string;
  details?: string;
}

@doc("Resource not found")
@error
model NotFoundError {
  code: "NOT_FOUND";
  message: string;
}

@doc("Slot is already booked by another booking")
@error
model SlotConflictError {
  code: "SLOT_ALREADY_BOOKED";
  message: string;
}

@doc("Request validation failed")
@error
model ValidationError {
  code: "VALIDATION_ERROR";
  message: string;
  details?: string;
}

@doc("Schedule interval overlap detected")
@error
model ScheduleOverlapError {
  code: "SCHEDULE_OVERLAP";
  message: string;
}

// ===================== API ENDPOINTS =====================

@doc("Manage user profiles (role selection)")
@route("/api/profiles")
interface Profiles {
  @doc("List all available profiles (admin + guests)")
  @get list(): Profile[];

  @doc("Create a new guest profile")
  @post
  create(@body body: ProfileCreate): Profile;
}

@route("/api/profiles/{id}")
interface ProfileItem {
  @doc("Update profile (name, locale, timeZone)")
  @put update(@path id: string, @body body: ProfileCreate): Profile | NotFoundError;

  @doc("Delete a guest profile")
  @delete delete(@path id: string): void | NotFoundError;
}

@doc("Manage calendar owner's working schedule")
@route("/api/admin/schedule")
interface AdminSchedule {
  @doc("Get the current working schedule")
  @get get(): Schedule;

  @doc("Update the working schedule (replaces all existing rules)")
  @put update(@body body: Schedule): Schedule | ScheduleOverlapError;
}

@doc("Admin: manage event types")
@route("/api/admin/event-types")
interface AdminEventTypes {
  @doc("Create a new event type")
  @post
  create(@body body: EventTypeCreate): EventType | ValidationError;

  @doc("List all event types (including inactive)")
  @get list(): EventType[];
}

@doc("Admin: single event type operations")
@route("/api/admin/event-types/{id}")
interface AdminEventType {
  @doc("Get event type by ID")
  @get get(@path id: string): EventType | NotFoundError;

  @doc("Update an existing event type")
  @put update(@path id: string, @body body: EventTypeUpdate): EventType | NotFoundError | ValidationError;

  @doc("Delete an event type")
  @delete
  delete(@path id: string): void | NotFoundError;
}

@doc("Admin: view all bookings")
@route("/api/admin/bookings")
interface AdminBookings {
  @doc("List bookings with optional date filter")
  @get list(
    @doc("Filter: bookings starting on or after this date (UTC)")
    @query dateFrom?: utcDateTime,

    @doc("Filter: bookings starting on or before this date (UTC)")
    @query dateTo?: utcDateTime,

    @doc("Filter: bookings status")
    @query status?: BookingStatus,
  ): Booking[];
}

@doc("Admin: manage bookings (confirm, reject, cancel)")
interface AdminBookingActions {
  @doc("Confirm a booking (requested → confirmed)")
  @route("/api/admin/bookings/{id}/confirm")
  @post
  confirm(@path id: string): Booking | NotFoundError;

  @doc("Reject a booking (requested → rejected)")
  @route("/api/admin/bookings/{id}/reject")
  @post
  reject(@path id: string): Booking | NotFoundError;

  @doc("Cancel a confirmed booking (confirmed → cancelled)")
  @route("/api/admin/bookings/{id}/cancel")
  @post
  cancel(@path id: string): Booking | NotFoundError;
}

@doc("Public: browse available event types")
@route("/api/event-types")
interface PublicEventTypes {
  @doc("List all active event types available for booking")
  @get list(): EventType[];
}

@doc("Public: single event type details")
@route("/api/event-types/{id}")
interface PublicEventType {
  @doc("Get event type details by ID")
  @get get(@path id: string): EventType | NotFoundError;
}

@doc("Check available time slots for an event type")
@route("/api/event-types/{eventTypeId}/slots")
interface Slots {
  @doc("Get available slots within a date range (max 14 days window)")
  @get getAvailable(
    @doc("Event type ID")
    @path eventTypeId: string,

    @doc("Start of the window (UTC)")
    @query dateFrom: utcDateTime,

    @doc("End of the window (UTC), dateTo - dateFrom <= 14 days")
    @query dateTo: utcDateTime,
  ): AvailableSlot[] | ValidationError;
}

@doc("Public: create and view bookings")
@route("/api/bookings")
interface PublicBookings {
  @doc("Create a new booking on an available slot")
  @post
  create(@body body: BookingCreate): Booking | SlotConflictError | ValidationError | NotFoundError;

  @doc("List bookings for a guest profile")
  @get list(
    @doc("Guest profile ID to filter by")
    @query guestProfileId: string,
  ): Booking[];
}

@doc("Public: cancel a booking")
@route("/api/bookings/{id}/cancel")
@post
op cancelBooking(@path id: string): Booking | NotFoundError;

@doc("Public: single booking details")
@route("/api/bookings/{id}")
interface PublicBooking {
  @doc("Get booking details by ID")
  @get get(@path id: string): Booking | NotFoundError;
}
