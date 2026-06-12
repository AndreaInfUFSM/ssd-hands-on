## Purpose

After a student submits, the app evaluates feedback rules (static, answer-key, rule-based, or hybrid) and displays results without exposing answer keys before submission.

## Requirements

### Requirement: Show static feedback after submission
The app SHALL display a configured static feedback message after submission when the feedback mode is "static".

#### Scenario: Static feedback is configured
- **WHEN** the student submits and the feedback mode is "static"
- **THEN** the app displays the configured static message

### Requirement: Show answer-key feedback for choice questions
The app SHALL compare the selected option against configured correct options and show a correct or incorrect message.

#### Scenario: Student selects a correct option
- **WHEN** the student selects a choice that matches a configured correct option and submits
- **THEN** the app displays the configured correct message

#### Scenario: Student selects an incorrect option
- **WHEN** the student selects a choice that does not match any configured correct option and submits
- **THEN** the app displays the configured incorrect message

### Requirement: Show rule-based feedback for open-text fields
The app SHALL check open-text responses against configured term-matching rules and display matching feedback messages.

#### Scenario: Response matches one or more rules
- **WHEN** the student submits an open-text response that contains terms from a configured rule
- **THEN** the app displays the feedback message for each matched rule

#### Scenario: Response does not match any rule
- **WHEN** the student submits an open-text response that does not contain terms from any configured rule
- **THEN** the app displays the configured default feedback message

#### Scenario: Rule terms are matched case-insensitively
- **WHEN** a student writes a term that differs in case from the configured term
- **THEN** the rule still matches

### Requirement: Show hybrid feedback combining choice and explanation
The app SHALL display both answer-key feedback for a choice field and rule-based feedback for an explanation field when the feedback mode is "hybrid".

#### Scenario: Hybrid feedback is configured
- **WHEN** the student submits a mixed response with a choice field and an explanation field
- **THEN** the app displays both choice feedback and explanation rule feedback

### Requirement: Do not expose answer keys before submission
The app SHALL NOT display feedback or answer-key information to the student before submission.

#### Scenario: Student has not yet submitted
- **WHEN** the student is viewing the challenge before submission
- **THEN** no feedback or answer-key information is visible

#### Scenario: Student reviews after submission
- **WHEN** the student has submitted and feedback is displayed
- **THEN** only the configured feedback messages are shown, not the raw answer-key configuration
