import { BaseModel } from '@ioc:Adonis/Lucid/Orm';
import { ResponsiveAttachmentContract } from '@ioc:Adonis/Addons/ResponsiveAttachment';
export declare class User extends BaseModel {
    id: number;
    email: string;
    avatar: ResponsiveAttachmentContract;
}
