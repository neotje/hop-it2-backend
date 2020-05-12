### How to make a template
example

```Javascript
class template {
    // this loads the properties of the given object.
    constructor(obj) {
        for (const key in obj) {
            const elem = obj[key];

            this[key] = elem;
        }
    }

    get compiledTemplate() {
        // template goes here
        return `
        <p>${this.firstname}</p>
        `
    }
}

module.exports = template;
```