# Sentinel Journal

## 2024-03-20 - Information Disclosure in Student Listing
**Vulnerability:** Tutors with no enrolled students could see ALL students in the system.
**Learning:** The fallback logic `else { $query->role('student'); }` was intended for Admins but was triggered for any user (including Tutors) when they had no students, because the condition was `if ($studentIds->isNotEmpty())`.
**Prevention:** Authorization checks should be explicit based on Role/Permission, not implicitly based on data existence. "No data" should usually mean "Show nothing", not "Show everything".
