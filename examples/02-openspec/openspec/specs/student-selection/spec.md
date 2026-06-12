## Purpose

Students identify themselves via a searchable autocomplete widget. The student list is loaded from the backend, filtered in-browser, and supports both listed and manual name entry modes.

## Requirements

### Requirement: Load active student list from backend
The app SHALL fetch the active student list from the backend API once when the page loads.

#### Scenario: Student list loads successfully
- **WHEN** the app loads and the backend returns a valid student list
- **THEN** the app stores the list in memory for autocomplete filtering

#### Scenario: Student list fails to load
- **WHEN** the app loads and the student list cannot be fetched
- **THEN** the app shows a clear error message and does not allow submission until the list is available

### Requirement: Filter student names as user types
The app SHALL filter the student list dynamically as the user types, using case-insensitive matching.

#### Scenario: User types a few characters
- **WHEN** the user types characters in the student name field
- **THEN** the app filters the full student list in the browser and shows matching names as selectable suggestions

#### Scenario: User clears the field
- **WHEN** the user clears the student name field
- **THEN** the app hides the suggestion list

### Requirement: Select a student from suggestions
The app SHALL record the selected student_id when the user picks a name from the suggestion list.

#### Scenario: User selects a suggestion
- **WHEN** the user clicks or taps on a suggestion from the list
- **THEN** the app fills the field with the display name and stores the associated student_id internally

#### Scenario: User edits after selecting a suggestion
- **WHEN** the user edits the text after selecting a suggestion and the text no longer matches the selected display name
- **THEN** the app clears the stored student_id

### Requirement: Manual name entry (configurable)
The app SHALL allow or disallow manual name entry based on backend configuration.

#### Scenario: Manual name entry is enabled, user types an unlisted name
- **WHEN** manual name entry is enabled by backend config and the user types a name not in the student list
- **THEN** the app allows submission with the typed name, storing student_source as "manual"

#### Scenario: Manual name entry is disabled, user types an unlisted name
- **WHEN** manual name entry is disabled and the user types a name not in the student list
- **THEN** the app prevents submission and prompts the user to select a listed student

#### Scenario: User types a matching name and submits (manual disabled)
- **WHEN** manual name entry is disabled and the user types a name that exactly matches a listed student
- **THEN** the app treats the submission as a listed student selection

### Requirement: Distinguish listed vs manual in submission
The app SHALL include student_source in the submission payload to indicate whether the student was selected from the list or entered manually.

#### Scenario: Student selected from list
- **WHEN** the student selects a name from the suggestion list
- **THEN** the submission includes student_id, student_display_name, and student_source = "listed"

#### Scenario: Student entered manually
- **WHEN** the student types a name not in the list (manual entry enabled)
- **THEN** the submission includes student_display_name, student_source = "manual", and student_id as empty
