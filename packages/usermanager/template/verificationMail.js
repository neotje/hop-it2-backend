class template {
    constructor(obj) {
        for (const key in obj) {
            const elem = obj[key];

            this[key] = elem;
        }
    }

    get compiledTemplate() {
        // template goes here
        return `
        <p>Beste ${this.firstname} ${this.lastname},</p>
        <p>Welkom bij hop-it.</p>
        <p><a href="${this.url}">Klik hier</a> om je account te verifieren.</p>
        <p>
            Neo Hop<br>
            Hop-IT
        </p>
        `
    }
}

module.exports = template;