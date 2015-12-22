## Guide

The ordering goes like this:

1. Component constructor()
2. Composite constructor()
3. Component init()
4. Composite init()

So, e.g., the component constructor can't refer to the composite at all.