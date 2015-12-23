## Guide

There's a bit of a dance between components and composites, since they both depend on each other. Rule of thumb:

* Use `constructor` to set up yourself
* Use `init` to talk with components if you're a composite, or vice versa.

The explicit ordering goes like this:

1. Component constructor() (can't use composite at all yet)
2. Composite constructor() (set up composite - components exist but are not fully created)
3. Component init() (set up components - composite exists but is not fully functional - because it doesn't have other components, duh)
4. Composite init() (components are now fully functional)