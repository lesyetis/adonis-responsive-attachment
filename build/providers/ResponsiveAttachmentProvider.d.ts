/// <reference types="@adonisjs/application/build/adonis-typings" />
import { ApplicationContract } from '@ioc:Adonis/Core/Application';
export default class ResponsiveAttachmentProvider {
    protected application: ApplicationContract;
    constructor(application: ApplicationContract);
    register(): void;
    boot(): void;
}
