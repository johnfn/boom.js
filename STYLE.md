# styleguide

Here's a few guidelines I follow for this project:

#### Configure tslint and follow the provided tslint.json

Rationale: It's good to have a set of standards. tslint even catches a few bugs.

#### Prefix private methods with an underscore

Rationale: Inevitably people are going to use this project from JavaScript. If they do so, it should be Obvious that they are doing the wrong thing (and by that, I mean using private methods, not using JavaScript... though that is also accurate :-)

#### The name of the backing variable for getters/setters called `foo` should be `_foo`

Rationale: We may as well standardize on something, and this is a common practice. It also allows the property to be discoverable by the Inspector.

#### Prefer `const` over `let`, even for arrays and objects where inner values change

Rationale: Stop reading `const` as "constant value." Start reading it as "single assignment." Yes, it means "constant value" in other programming languages, but JavaScript doesn't have those semantics. We should use the tool for what it was actually designed for, rather than for what we think that it should have been designed for.

"Single assignment" is pretty useful once you get used to it.

#### Never use `var`

Rationale: Everyone agrees on this.

The only case I've found that `var` is necessary is when TypeScript refuses to capture a let/const in a function in a loop but when I can verify that it is fine. TypeScript is fixing that case in 1.8.
