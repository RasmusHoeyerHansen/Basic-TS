class ProjectState {

    private listeners : any[] = [];

    private projects : any[] = [];
    private static instance : ProjectState;

    private constructor() {

    }

    public addListener(listenerFunction : Function) {
        this.listeners.push(listenerFunction)

    }

    static getSingleton() {
        if (this.instance){
            return this.instance;
        } else {
            this.instance = new ProjectState()
            return this.instance;
        }
    }

    addProject(title: string, descr : string, nrPeople:  number){
        const newProject = {
            id : Math.random().toString(),
            title:title,
            description:descr,
            people: nrPeople
        };
        this.projects.push(newProject);

        for (const listener of this.listeners){
            listener(this.projects.slice());
        }

        this.projects.push(newProject);
    }
}

const projectState = ProjectState.getSingleton();




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
abstract class HTMLProjectElement {
    protected htmlHostElement: HTMLDivElement;

    protected constructor() {
        this.htmlHostElement = document.getElementById("app") as HTMLDivElement;
    }


    protected attachToContent(element: Element, position: 'beforeend' | 'afterbegin') {
        this.htmlHostElement.insertAdjacentElement(position, element);
    }
}


 // Project list
class ProjectList extends HTMLProjectElement{
    private htmlTemplate: HTMLTemplateElement;
    private sectionElement: HTMLElement;
    private assignedProject : any[];

    constructor(public projectType: 'active' | 'inactive' | 'finished') {
        super()
        this.htmlTemplate = document.getElementById("project-list") as HTMLTemplateElement;
        this.assignedProject = [];

        //Get the fields and button of the form as deep copy
        const htmlNode = document.importNode(this.htmlTemplate.content, true);
        //Get the first form element an attach it to host element
        this.sectionElement = htmlNode.firstElementChild as HTMLElement;
        this.sectionElement.id = `${this.projectType}-projects`;

        projectState.addListener( (projects : any[] ) => {
            this.assignedProject = projects;
            this.renderProjects();
        });

        this.attachToContent(this.sectionElement, "beforeend")
        this.renderContent();

    }


    private renderContent(){
        const listId =`${this.projectType}-project-list`;
        this.sectionElement.querySelector("ul")!.id = listId;
        this.sectionElement.querySelector("h2")!.textContent
            = this.projectType.toUpperCase() + 'PROJECT';
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.projectType}-project-list`)! as HTMLUListElement;
        for (const projectItem of this.assignedProject){
            const listItem = document.createElement("li");
            listItem.textContent = projectItem.title;
            listEl.appendChild(listItem);
        }
    }
}

class ProjectInputForm extends HTMLProjectElement{

    private htmlTemplate: HTMLTemplateElement;
    private formElement: HTMLFormElement;
    private titleInput: HTMLInputElement;
    private peopleInput: HTMLInputElement;
    private descriptionInput: HTMLInputElement;

    constructor() {
        super();
        this.htmlTemplate = document.getElementById("project-input") as HTMLTemplateElement;
        this.htmlTemplate = document.getElementById("project-input") as HTMLTemplateElement;
        this.htmlHostElement = document.getElementById("app") as HTMLDivElement;

        //Get the fields and button of the form as deep copy
        const htmlNode = document.importNode(this.htmlTemplate.content, true);
        //Get the first form element an attach it to host element
        this.formElement = htmlNode.firstElementChild as HTMLFormElement;
        this.formElement.id = "user-input";


        this.titleInput = this.formElement.querySelector("#title") as HTMLInputElement;
        this.peopleInput = this.formElement.querySelector("#people") as HTMLInputElement;
        this.descriptionInput = this.formElement.querySelector("#description") as HTMLInputElement;

        this.configureSubmitListener();
        this.attachToContent(this.formElement, "afterbegin");
    }



    @AautoBind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.getUserInput();

        //Typescript compiles tuples to Array
        if (Array.isArray(userInput)) {
            //Create three variables
            const [title, desc, people] = userInput;
            projectState.addProject(title,desc,people)
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

const projectInputInstance = new ProjectInputForm();
const projectList = new ProjectList('active');
const projectList2 = new ProjectList('finished');