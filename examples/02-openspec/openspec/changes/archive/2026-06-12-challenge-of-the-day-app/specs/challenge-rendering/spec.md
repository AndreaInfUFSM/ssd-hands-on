## ADDED Requirements

### Requirement: Load current challenge from backend
The app SHALL fetch the current daily challenge from the backend API on page load.

#### Scenario: Challenge available for today
- **WHEN** the app loads and a challenge is configured for today
- **THEN** the app renders the challenge blocks

#### Scenario: No challenge available for today
- **WHEN** the app loads and no challenge is configured for today
- **THEN** the app shows a clear message saying no challenge is available today

#### Scenario: Backend returns malformed challenge JSON
- **WHEN** the backend returns challenge JSON that does not match the expected structure
- **THEN** the app shows a descriptive error message and does not crash silently

### Requirement: Render markdown blocks from JSON
The app SHALL render challenge blocks of type "markdown" as formatted text content.

#### Scenario: Challenge contains a markdown block
- **WHEN** the challenge JSON includes an intro, prompt, or after-submission block with type "markdown"
- **THEN** the app displays the content as formatted text

### Requirement: Render code blocks from JSON
The app SHALL render challenge blocks of type "code" with a monospace font and language label.

#### Scenario: Challenge contains a code block
- **WHEN** the challenge JSON includes a block with type "code"
- **THEN** the app displays the content in a preformatted monospace style with its language label shown

### Requirement: Render image blocks from JSON
The app SHALL render challenge blocks of type "image" with the image URL and alt text.

#### Scenario: Challenge contains an image block with caption
- **WHEN** the challenge JSON includes a block with type "image" and a caption field
- **THEN** the app displays the image, its alt text, and the caption

#### Scenario: Challenge contains an image block without caption
- **WHEN** the challenge JSON includes a block with type "image" and no caption field
- **THEN** the app displays the image with alt text and no caption

### Requirement: Render callout blocks from JSON
The app SHALL render challenge blocks of type "callout" with a style-specific visual treatment.

#### Scenario: Challenge contains a callout block
- **WHEN** the challenge JSON includes a block with type "callout"
- **THEN** the app displays the content with visual styling matching the callout style (tip, warning, note, or reflection)

### Requirement: Display after-submission blocks
The app SHALL show after-submission blocks after a successful response is submitted.

#### Scenario: After-submission blocks are configured
- **WHEN** the student submits a response successfully and the challenge has after_submission blocks
- **THEN** the app displays those blocks after the feedback

#### Scenario: No after-submission blocks configured
- **WHEN** the student submits a response successfully and the challenge has no after_submission blocks
- **THEN** the app does not display additional blocks after feedback
