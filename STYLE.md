# styleguide

Here's a few guidelines I follow for this project:

#### Configure tslint and follow the provided tslint.json

Rationale: It's good to have a set of standards. tslint even catches a few bugs.

#### Private methods annotated with an underscore

Rationale: Inevitably people are going to use this project from JavaScript. If they do so, it should be Obvious and Ugly that they are doing the wrong thing (and by that, I mean using private methods, not using JavaScript... though that works, too. :-)

#### Prefer `const` over `let`, even for arrays and objects where inner values change

Rationale: Stop reading `const` as "constant value." Start reading it as "single assignment." Yes, it means "constant value" in other programming languages, but JavaScript doesn't have those semantics. We should use the tool for what it was actually designed for, rather than for what we think that it should have been designed for.

"Single assignment" is pretty useful once you get used to it.
