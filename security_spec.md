# Vida Fit Pro - Security Specifications

## 1. Data Invariants

- **PII Isolation**: Complete patient registrations (name, CPF, phone, address, clinical notes) represent sensitive Personally Identifiable Information (PII) and protected medical health records. Only the owner user (patient) or authorized clinical practitioners (Nutritionists, Personal Trainers, Admins) are allowed to read or write this data.
- **Master Gate Relation Constraint**: Bioimpedance records, Diet plans, workouts, and Physical assessments are subresources that belong to a specific patient document and are only created under `/patients/{patientId}` paths. They cannot exist orphaned or stand-alone.
- **Identity Integrity**: Pacientes can only request or view their own subresources in `/patients/{patientId}/*`. They cannot modify their own assessments, bioimpedances, food plans, or workout routines—these must be authored strictly by a clinician (nutri, personal, or admin).
- **Immutability Invariants**: Critical audit trail variables like `registrationDate` or `patientId` must be protected from modification once committed.

---

## 2. The "Dirty Dozen" Threat Vectors (Shadow Payloads)

1. **Anonymous Read Leak**: Unauthorized clients trying to read `/patients` collection without logging in.
2. **PII Hijacking**: A logged-in paciente trying to read another patient's document under `/patients/{otherId}`.
3. **Privilege Escalation Onboarding**: A paciente attempts to create their own record under `/patients` setting `"source": "Google Forms"` and modifying clinician assessment flags.
4. **Assessment Spoofing**: Paciente tries to write or update a Physical Assessment under `/patients/{uid}/assessments/{assessId}` directly.
5. **Visceral Fat Poisoning**: A client attempts to corrupt or lower their visceral fat count in a Bioimpedance document.
6. **Shadow Field Injection**: Inserting a `"systemVerifiedAdmin": true` check flag during manual updates.
7. **Workout Modification Bypass**: A patient attempts to overwrite exercises, reps, or cargas inside `/patients/{uid}/workouts`.
8. **Negative Body Fat Injection**: Writing a physical assessment with negative values (`-5%` body fat) or astronomical heights.
9. **Diet Plan Overwrite**: Paciente attempts to alter caloric values or quantities assigned in their `/patients/{uid}/foodPlans`.
10. **Spoofing Clinician Assignment**: A patient injects their own record with an author ID linked to `admin@vidafitpro.com` while registering.
11. **Orphaned Subコレクション Creation**: Writing a bioimpedance record with a mismatching patientId field from the document path.
12. **Id Poisoning**: Writing a subcollection item with a document ID filled with invalid symbols like `%C$@#%` to cause Denial of Service.

---

## 3. Test Cases Draft

All the dirty payload vectors are tested using rigorous schema validation rules, verified through custom validations ensuring:
- `request.auth != null`
- Document owner or therapist role authorization.
- Type integrity inside fields match schemas exactly.
- Length and character validations.
