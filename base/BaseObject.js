import InvalidCallError from "./InvalidCallError";
import UnknownPropertyError from "./UnknownPropertyError";
import { ucfirst } from "locutus/php/strings";

/**
 * BaseObject is the base class that is used to implement custom getters and setters
 * 
 * Getters are defined as `getProp` and setters are defined as `setProp` for example a label
 * 
 * ```javascript
 * var label = 'Hello World'; // a private variable in a closure function, such as when using Webpack
 * class MyClass extends BaseObject {
 *   getLabel() {
 *     return label;
 *   }
 * 
 *   setLabel(value) {
 *     label = value;
 *   }
 * }
 * ```
 * 
 * A class that has a getter, but no setter is considered read-only. Likewise, a class that has a setter, but no getter is considered write-only.
 * 
 * Using a new instance of BaseObject or a subclass will invoke the `init()`. It's recommended that you use the `init()` method for initializing the object
 * 
 * If a subclass of the BaseObject needs to override the constructor it should call the like this:
 * 
 * ```javascript
 * class MyClass extends BaseObject {
 *   constructor() {
 *      ...
 *      super();
 *   }
 * }
 * 
 * Calling the parent implementation must be done at the end of the constructor
 */
export default class BaseObject {
    /**
     * This is used to return the class name of the instantiate object
     * To return a class name of an uninstantiated object just use the Object's static `name` property
     */
    className() {
        return this.constructor.name;
    }
    
    constructor(config = {}) {
        this.init();
        return new Proxy(this, this);
    }
    
    /**
     * This is a placeholder method
     */
    init() {}
    
    /**
     * get is used to implement a custom getter for the proxy object
     * it will get a direct property or call the custom getter method if it exists
     * 
     * @param {*} target 
     * @param {*} prop 
     * @returns {*}
     * @throws InvalidCallError
     * @throws UnknownPropertyError
     */
    get (target, prop) {
        var getter = 'get' + ucfirst(prop);
        if(prop in target) {
            return target[prop];
        }
        else if(getter in target) {
            return target[getter]();
        }
        else if('set' + ucfirst(prop) in target) {
            throw new InvalidCallError(`Getting write-only property: ${target.constructor.name}.${prop}`);
        }
      
        throw new UnknownPropertyError(`Getting unknown property: ${target.cosntructor.name}.${prop}`);
    }
    
    /**
     * set is used to implement a custom setter for the proxy object 
     * it will set a direct property or call the custom setter method if it exists and pass it the value
     * 
     * @param {*} target 
     * @param {*} prop 
     * @param {*} value 
     * @returns {boolean}
     * @throws InvalidCallError
     * @throws UnknownPropertyError
     */
    set (target, prop, value) {
        var setter = 'set' + ucfirst(prop);
        if(prop in target) {
            target[prop] = value;
            return true;
        }
        else if(setter in target) {
            target[setter](value);
            return true;
        }
        else if('get' + ucfirst(prop) in target) {
            throw new InvalidCallError(`Setting read-only property: ${target.constructor.name}.${prop}`);
        }
      
        throw new UnknownPropertyError(`Setting unknown property: ${target.cosntructor.name}.${prop}`);
    }

    /**
     * deleteProperty is used to implement a custom delete method that will set the property value to null
     * 
     * Note: properties are not actually deleted because of how custom getters and setters work. 
     * It's set to null and that will allow garbage collection for the old value
     * 
     * @param {*} target The object to modify
     * @param {*} prop The object property to modify
     * @returns {boolean|void}
     * @throws InvalidCallError
     */
    deleteProperty(target, prop) {
        let setter = 'set' + ucfirst(prop);
        if(prop in target) {
            target[prop] = null;
            return true;
        }
        else if(setter in target) {
            target[setter](null);
            return true;
        }
        else if('get' + ucfirst(prop) in target) {
            throw new InvalidCallError(`Unsetting read-only property: ${target.constructor.name}.${prop}`);
        }
    }
}
