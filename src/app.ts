//Decorators and such
interface Validatable {
    minLength?: number;
    value: string |number;
    required?: boolean;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(input : Validatable) {
    let isValid = true;

    if (input.required){
        isValid = isValid && input.value.toString().trim().length !== 0;
    }
    if (input.minLength != null && typeof input.value === "string"){
        isValid = isValid && input.value.length > input.minLength;
    }
    if (input.maxLength != null && typeof input.value === "string"){
        isValid = isValid && input.value.length <= input.maxLength;
    }
    if (input.min != null  && typeof input.value === "number"){
        isValid = isValid && input.value > input.min;
    }
    if (input.max != null  && typeof input.value === "number"){
        isValid = isValid && input.value <= input.max;
    }
    return isValid;

}


function AautoBind(target: any,
                   methodname: string,
                   descriptor: PropertyDescriptor
) {

    const originalMethod = descriptor.value;
    const adjustedDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            return originalMethod.bind(this);
        }
    };
    return adjustedDescriptor;
}


class ProjectInput {
    htmlTemplate: HTMLTemplateElement;
    htmlHostElement: HTMLDivElement;
    private formElement: Element;
    private titleInput: HTMLInputElement;
    private peopleInput: HTMLInputElement;
    private descriptionInput: HTMLInputElement;

    constructor() {
        this.htmlTemplate = document.getElementById("project-input") as HTMLTemplateElement;
        this.htmlHostElement = document.getElementById("app") as HTMLDivElement;

        //Get the fields and button of the form as deep copy
        const htmlNode = document.importNode(this.htmlTemplate.content, true);
        //Get the first form element an attach it to host element
        this.formElement = htmlNode.firstElementChild as Element;
        this.formElement.id = "user-input";


        this.titleInput = this.formElement.querySelector("#title") as HTMLInputElement;
        this.peopleInput = this.formElement.querySelector("#people") as HTMLInputElement;
        this.descriptionInput = this.formElement.querySelector("#description") as HTMLInputElement;

        this.configureSubmitListener();
        this.attachToContent(this.formElement);
    }

    //Attach content to host element
    private attachToContent(element: Element) {
        this.htmlHostElement.insertAdjacentElement("afterbegin", element);
    }

    @AautoBind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.getUserInput();

        //Typescript compiles tuples to Array
        if (Array.isArray(userInput)) {
            //Create three variables
            const [title, desc, people] = userInput;
            this.clearForm();
        }
    }

    private clearForm() {
        this.titleInput.value = '';
        this.descriptionInput.value = '';
        this.peopleInput.value = '';
    }


    private configureSubmitListener() {
        //Configure the submit handler such that 'this' will refer to the class, and not the
        this.formElement.addEventListener('submit', this.submitHandler)
    }

    private getUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInput.value;
        const desc = this.descriptionInput.value;
        const nrPeople = this.peopleInput.value;


        if (!validate({value: enteredTitle, required: true}) ||
            !validate({value: desc, required: true, minLength: 5}) ||
            !validate({value: +nrPeople, required: true, min: 1, max: 5})
        ) {
            alert("Invalid input")
            return;
        } else {
            //+ as float
            return [enteredTitle, desc, +nrPeople];
        }

    }
}

const projectInputInstance = new ProjectInput();