declare module '@ioc:Adonis/Core/Application' {
    import ResponsiveAttachment from '@ioc:Adonis/Addons/ResponsiveAttachment';
    interface ContainerBindings {
        'Adonis/Addons/ResponsiveAttachment': typeof ResponsiveAttachment;
    }
}
