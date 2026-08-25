All features, refactors, or changes to the codebase must follow the steps below:

1 - Analyze the requested feature or change and check whether it is already implemented or matches the current state of the project. In other words, verify that the feature or change makes sense given the current codebase.
1.1 - For a change or new feature, first reproduce the desired behavior through a unit test describing what is expected (1 file per feature). In other words, we work with TDD (Test Driven Development) whenever possible. If this is an exception, request prior approval.
1.2 - After writing the test, let it fail, since we don't have the implementation yet.
1.3 - Plan and implement the feature, following good practices and the existing structure, without excessive comments (clean code is preferable to many comments; if a comment is needed, keep it concise, a single line in lowercase).
1.4 - Everything created must be componentized, following the current structure we have, atomic design, and unit tests for the new components and features.
1.5 - After implementing the feature, run the test again and, if it passes, review whether any detail was missed. If everything is correct, check the README.md or related documentation to see if anything related to the new feature or change needs to be updated.
1.6 - Update the project documentation, if necessary, to reflect the changes made.
1.7 - Log the changes in the project's changelog (unless it's a trivial change).
1.8 - Move on to the next mapped feature or change.
1.9 - At the end, do a general code review to make sure everything is compliant with the project's standards before submitting it for code review.
1.10 - Return a summary of the changes made, including links to the unit tests and updated documentation, if applicable.
