"use strict";
/*
 * adonis-responsive-attachment
 *
 * (c) Ndianabasi Udonkang <ndianabasi@furnish.ng>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const japa_1 = __importDefault(require("japa"));
const path_1 = require("path");
const supertest_1 = __importDefault(require("supertest"));
const http_1 = require("http");
const BodyParser_1 = require("@adonisjs/bodyparser/build/src/BodyParser");
const ImageManipulationHelper_1 = require("../src/Helpers/ImageManipulationHelper");
const Attachment_1 = require("../src/Attachment");
const test_helpers_1 = require("../test-helpers");
const promises_1 = require("fs/promises");
let app;
const samplePersistedImageData = {
    isPersisted: true,
    isLocal: false,
    name: 'original_ckw5lpv7v0002egvobe1b0oav.jpg',
    size: 291.69,
    hash: 'ckw5lpv7v0002egvobe1b0oav',
    width: 1500,
    format: 'jpeg',
    height: 1000,
    extname: 'jpg',
    mimeType: 'image/jpeg',
    url: '/uploads/original_ckw5lpv7v0002egvobe1b0oav.jpg?signature=eyJtZXNzYWdlIjoiL3VwbG9hZHMvb3JpZ2luYWxfY2t3NWxwdjd2MDAwMmVndm9iZTFiMG9hdi5qcGcifQ.ieXMlaRb8izlREvJ0E9iMY0I3iedalmv-pvOUIrfEZc',
    breakpoints: {
        thumbnail: {
            name: 'thumbnail_ckw5lpv7v0002egvobe1b0oav.jpg',
            hash: 'ckw5lpv7v0002egvobe1b0oav',
            extname: 'jpg',
            mimeType: 'image/jpeg',
            width: 234,
            height: 156,
            size: 7.96,
            url: '/uploads/thumbnail_ckw5lpv7v0002egvobe1b0oav.jpg?signature=eyJtZXNzYWdlIjoiL3VwbG9hZHMvdGh1bWJuYWlsX2NrdzVscHY3djAwMDJlZ3ZvYmUxYjBvYXYuanBnIn0.RGGimHh6NuyPrB2ZgmudE7rH4RRCT3NL7kex9EmSyIo',
        },
        large: {
            name: 'large_ckw5lpv7v0002egvobe1b0oav.jpg',
            hash: 'ckw5lpv7v0002egvobe1b0oav',
            extname: 'jpg',
            mimeType: 'image/jpeg',
            width: 1000,
            height: 667,
            size: 129.15,
            url: '/uploads/large_ckw5lpv7v0002egvobe1b0oav.jpg?signature=eyJtZXNzYWdlIjoiL3VwbG9hZHMvbGFyZ2VfY2t3NWxwdjd2MDAwMmVndm9iZTFiMG9hdi5qcGcifQ.eNC8DaqYCYd4khKhqS7DKI66SsLpD-vyVIaP8rzMmAA',
        },
        medium: {
            name: 'medium_ckw5lpv7v0002egvobe1b0oav.jpg',
            hash: 'ckw5lpv7v0002egvobe1b0oav',
            extname: 'jpg',
            mimeType: 'image/jpeg',
            width: 750,
            height: 500,
            size: 71.65,
            url: '/uploads/medium_ckw5lpv7v0002egvobe1b0oav.jpg?signature=eyJtZXNzYWdlIjoiL3VwbG9hZHMvbWVkaXVtX2NrdzVscHY3djAwMDJlZ3ZvYmUxYjBvYXYuanBnIn0.2ADmssxFC0vxmq4gJEgjb9Fxo1qcQ6tMVeKBqZ1ENkM',
        },
        small: {
            name: 'small_ckw5lpv7v0002egvobe1b0oav.jpg',
            hash: 'ckw5lpv7v0002egvobe1b0oav',
            extname: 'jpg',
            mimeType: 'image/jpeg',
            width: 500,
            height: 333,
            size: 32.21,
            url: '/uploads/small_ckw5lpv7v0002egvobe1b0oav.jpg?signature=eyJtZXNzYWdlIjoiL3VwbG9hZHMvc21hbGxfY2t3NWxwdjd2MDAwMmVndm9iZTFiMG9hdi5qcGcifQ.I8fwMRwY5azvlS_8B0K40BWKQNLuS-HqCB_3RXryOok',
        },
    },
};
japa_1.default.group('ResponsiveAttachment | fromDbResponse', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('create image attachment instance from db response', (assert) => {
        const responsiveAttachment = Attachment_1.ResponsiveAttachment.fromDbResponse(JSON.stringify(samplePersistedImageData));
        assert.isTrue(responsiveAttachment?.isPersisted);
        assert.isFalse(responsiveAttachment?.isLocal);
    });
    (0, japa_1.default)('save method should result in noop when image attachment is created from db response', async (assert) => {
        const responsiveAttachment = Attachment_1.ResponsiveAttachment.fromDbResponse(JSON.stringify(samplePersistedImageData));
        await responsiveAttachment?.save();
        assert.equal(responsiveAttachment?.name, 'original_ckw5lpv7v0002egvobe1b0oav.jpg');
        assert.equal(responsiveAttachment?.breakpoints?.thumbnail.name, 'thumbnail_ckw5lpv7v0002egvobe1b0oav.jpg');
        assert.equal(responsiveAttachment?.breakpoints?.small.name, 'small_ckw5lpv7v0002egvobe1b0oav.jpg');
        assert.equal(responsiveAttachment?.breakpoints?.medium.name, 'medium_ckw5lpv7v0002egvobe1b0oav.jpg');
        assert.equal(responsiveAttachment?.breakpoints?.large.name, 'large_ckw5lpv7v0002egvobe1b0oav.jpg');
    });
    (0, japa_1.default)('delete persisted images', async (assert) => {
        const responsiveAttachment = Attachment_1.ResponsiveAttachment.fromDbResponse(JSON.stringify(samplePersistedImageData));
        await responsiveAttachment?.delete();
        assert.isTrue(responsiveAttachment?.isDeleted);
    });
    (0, japa_1.default)('compute image urls', async (assert) => {
        const responsiveAttachment = Attachment_1.ResponsiveAttachment.fromDbResponse(JSON.stringify(samplePersistedImageData));
        responsiveAttachment?.setOptions({ preComputeUrls: true });
        await responsiveAttachment?.computeUrls();
        assert.match(responsiveAttachment?.url, /\/uploads\/original_ckw5lpv7v0002egvobe1b0oav\.jpg\?signature=/);
        assert.match(responsiveAttachment?.breakpoints?.thumbnail.url, /\/uploads\/thumbnail_ckw5lpv7v0002egvobe1b0oav\.jpg\?signature=/);
        assert.match(responsiveAttachment?.breakpoints?.small.url, /\/uploads\/small_ckw5lpv7v0002egvobe1b0oav\.jpg\?signature=/);
        assert.match(responsiveAttachment?.breakpoints?.large.url, /\/uploads\/large_ckw5lpv7v0002egvobe1b0oav\.jpg\?signature=/);
        assert.match(responsiveAttachment?.breakpoints?.medium.url, /\/uploads\/medium_ckw5lpv7v0002egvobe1b0oav\.jpg\?signature=/);
    });
    (0, japa_1.default)('compute image urls from a custom method', async (assert) => {
        const responsiveAttachment = Attachment_1.ResponsiveAttachment.fromDbResponse(JSON.stringify(samplePersistedImageData));
        responsiveAttachment?.setOptions({
            preComputeUrls: async (_, image) => {
                return {
                    url: `/custom_folder${image.url}`,
                    breakpoints: {
                        thumbnail: {
                            url: `/custom_folder${image.breakpoints?.thumbnail.url}`,
                        },
                        small: { url: `/custom_folder${image.breakpoints?.small.url}` },
                        medium: { url: `/custom_folder${image.breakpoints?.medium.url}` },
                        large: { url: `/custom_folder${image.breakpoints?.large.url}` },
                    },
                };
            },
        });
        await responsiveAttachment?.computeUrls();
        assert.match(responsiveAttachment?.url, /\/custom_folder\/uploads\/original_ckw5lpv7v0002egvobe1b0oav\.jpg\?signature=/);
        assert.match(responsiveAttachment?.urls?.breakpoints?.small.url, /\/custom_folder\/uploads\/small_ckw5lpv7v0002egvobe1b0oav\.jpg\?signature=/);
        assert.match(responsiveAttachment?.urls?.breakpoints?.large.url, /\/custom_folder\/uploads\/large_ckw5lpv7v0002egvobe1b0oav\.jpg\?signature=/);
        assert.match(responsiveAttachment?.urls?.breakpoints?.medium.url, /\/custom_folder\/uploads\/medium_ckw5lpv7v0002egvobe1b0oav\.jpg\?signature=/);
    });
});
japa_1.default.group('ResponsiveAttachment | fromFile', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('create attachment from the user-uploaded image', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(file);
                await responsiveAttachment?.save();
                assert.isTrue(responsiveAttachment?.isPersisted);
                assert.isTrue(responsiveAttachment?.isLocal);
                assert.isTrue(await Drive.exists(responsiveAttachment?.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.thumbnail.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.small.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.medium.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.large.name));
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        assert.isTrue(await Drive.exists(body.name));
        assert.isTrue(await Drive.exists(body.breakpoints?.thumbnail.name));
        assert.isTrue(await Drive.exists(body.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(body.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(body.breakpoints?.large.name));
    });
    (0, japa_1.default)('change the format of the user-uploaded image', async (assert) => {
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(file);
                responsiveAttachment?.setOptions({ preComputeUrls: true, forceFormat: 'webp' });
                await responsiveAttachment?.save();
                assert.isTrue(responsiveAttachment?.isPersisted);
                assert.isTrue(responsiveAttachment?.isLocal);
                assert.include(responsiveAttachment?.name, 'webp');
                assert.include(responsiveAttachment?.breakpoints?.thumbnail.name, 'webp');
                assert.include(responsiveAttachment?.breakpoints?.small.name, 'webp');
                assert.include(responsiveAttachment?.breakpoints?.medium.name, 'webp');
                assert.include(responsiveAttachment?.breakpoints?.large.name, 'webp');
                assert.include(responsiveAttachment?.url, 'webp');
                assert.include(responsiveAttachment?.urls?.breakpoints?.large.url, 'webp');
                assert.include(responsiveAttachment?.urls?.breakpoints?.medium.url, 'webp');
                assert.include(responsiveAttachment?.urls?.breakpoints?.small.url, 'webp');
                assert.include(responsiveAttachment?.urls?.breakpoints?.thumbnail.url, 'webp');
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
    });
    (0, japa_1.default)('pre-compute urls for newly-created images', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(file);
                responsiveAttachment?.setOptions({ preComputeUrls: true });
                await responsiveAttachment?.save();
                assert.isTrue(responsiveAttachment?.isPersisted);
                assert.isTrue(responsiveAttachment?.isLocal);
                assert.isNotEmpty(responsiveAttachment?.urls);
                assert.isDefined(responsiveAttachment?.url);
                assert.isDefined(responsiveAttachment?.urls?.breakpoints?.large.url);
                assert.isDefined(responsiveAttachment?.urls?.breakpoints?.medium.url);
                assert.isDefined(responsiveAttachment?.urls?.breakpoints?.small.url);
                assert.isDefined(responsiveAttachment?.urls?.breakpoints?.thumbnail.url);
                assert.isTrue(await Drive.exists(responsiveAttachment?.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.large.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.medium.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.small.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.thumbnail.name));
                assert.isTrue(responsiveAttachment?.breakpoints.thumbnail.size <
                    responsiveAttachment?.breakpoints.small.size);
                assert.isTrue(responsiveAttachment?.breakpoints.small.size <
                    responsiveAttachment?.breakpoints.medium.size);
                assert.isTrue(responsiveAttachment?.breakpoints.medium.size <
                    responsiveAttachment?.breakpoints.large.size);
                assert.isTrue(responsiveAttachment?.breakpoints.large.size < responsiveAttachment?.size);
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
    });
    (0, japa_1.default)('delete local images', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(file);
                responsiveAttachment?.setOptions({ preComputeUrls: true });
                await responsiveAttachment?.save();
                await responsiveAttachment?.delete();
                assert.isFalse(responsiveAttachment?.isPersisted);
                assert.isTrue(responsiveAttachment?.isLocal);
                assert.isTrue(responsiveAttachment?.isDeleted);
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        assert.isDefined(body.url);
        assert.isDefined(body.breakpoints.large.url);
        assert.isDefined(body.breakpoints.medium.url);
        assert.isDefined(body.breakpoints.small.url);
        assert.isDefined(body.breakpoints.thumbnail.url);
        assert.isNotNull(body.url);
        assert.isNotNull(body.breakpoints.large.url);
        assert.isNotNull(body.breakpoints.medium.url);
        assert.isNotNull(body.breakpoints.small.url);
        assert.isNotNull(body.breakpoints.thumbnail.url);
        assert.isFalse(await Drive.exists(body.name));
        assert.isFalse(await Drive.exists(body.breakpoints.large.name));
        assert.isFalse(await Drive.exists(body.breakpoints.medium.name));
        assert.isFalse(await Drive.exists(body.breakpoints.small.name));
        assert.isFalse(await Drive.exists(body.breakpoints.thumbnail.name));
    });
    (0, japa_1.default)('do not create any image when image is not attached', async (assert) => {
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const responsiveAttachment = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                await responsiveAttachment?.save();
                assert.isNull(responsiveAttachment);
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server).post('/');
        assert.isEmpty(body);
    });
});
japa_1.default.group('ImageManipulationHelper', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('getDimensions', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                await file.moveToDisk(Attachment_1.tempUploadFolder);
                const buffer = await Drive.get((0, path_1.join)(Attachment_1.tempUploadFolder, file.fileName));
                const { width, height } = await (0, ImageManipulationHelper_1.getDimensions)(buffer);
                assert.equal(width, 1500);
                assert.equal(height, 1000);
                ctx.response.send({ width, height });
                ctx.response.finish();
            });
        });
        const { body: { width, height }, } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        assert.equal(width, 1500);
        assert.equal(height, 1000);
    });
});
japa_1.default.group('Images below the thumbnail resize options', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('does not create thumbnail and responsive images for files below the THUMBNAIL_RESIZE_OPTIONS', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(file);
                await responsiveAttachment?.save();
                assert.isTrue(responsiveAttachment?.isPersisted);
                assert.isTrue(responsiveAttachment?.isLocal);
                assert.isTrue(await Drive.exists(responsiveAttachment?.name));
                assert.isUndefined(responsiveAttachment?.breakpoints);
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-150x100.jpg'));
    });
    (0, japa_1.default)('pre-compute urls for newly created image below the THUMBNAIL_RESIZE_OPTIONS', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(file);
                responsiveAttachment?.setOptions({ preComputeUrls: true });
                await responsiveAttachment?.save();
                assert.isTrue(responsiveAttachment?.isPersisted);
                assert.isTrue(responsiveAttachment?.isLocal);
                assert.isNotEmpty(responsiveAttachment?.urls);
                assert.isDefined(responsiveAttachment?.url);
                assert.isNotNull(responsiveAttachment?.url);
                assert.isUndefined(responsiveAttachment?.urls?.breakpoints);
                assert.isTrue(await Drive.exists(responsiveAttachment?.name));
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-150x100.jpg'));
    });
});
japa_1.default.group('Images below the large breakeven point', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('create attachment from the user uploaded image', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(file);
                await responsiveAttachment?.save();
                assert.isTrue(responsiveAttachment?.isPersisted);
                assert.isTrue(responsiveAttachment?.isLocal);
                assert.isTrue(await Drive.exists(responsiveAttachment?.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.thumbnail.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.small.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.medium.name));
                assert.isUndefined(responsiveAttachment?.breakpoints?.large);
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-825x550.jpg'));
    });
    (0, japa_1.default)('pre-compute urls for newly created images', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(file);
                responsiveAttachment?.setOptions({ preComputeUrls: true });
                await responsiveAttachment?.save();
                assert.isTrue(responsiveAttachment?.isPersisted);
                assert.isTrue(responsiveAttachment?.isLocal);
                assert.isDefined(responsiveAttachment?.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.medium.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.small.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.thumbnail.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.large);
                assert.isTrue(await Drive.exists(responsiveAttachment?.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.medium.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.small.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.thumbnail.name));
                assert.isUndefined(responsiveAttachment?.breakpoints?.large);
                assert.isTrue(responsiveAttachment?.breakpoints.thumbnail.size <
                    responsiveAttachment?.breakpoints.small.size);
                assert.isTrue(responsiveAttachment?.breakpoints.small.size <
                    responsiveAttachment?.breakpoints.medium.size);
                assert.isTrue(responsiveAttachment?.breakpoints.medium.size < responsiveAttachment?.size);
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-825x550.jpg'));
    });
});
japa_1.default.group('Do not generate responsive images when `options.responsiveDimensions` is false', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('create attachment from the user uploaded image', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container
                .resolveBinding('Adonis/Core/HttpContext')
                .create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(file);
                responsiveAttachment?.setOptions({ responsiveDimensions: false });
                await responsiveAttachment?.save();
                assert.isTrue(responsiveAttachment?.isPersisted);
                assert.isTrue(responsiveAttachment?.isLocal);
                assert.isTrue(await Drive.exists(responsiveAttachment?.name));
                assert.isUndefined(responsiveAttachment?.breakpoints);
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-825x550.jpg'));
    });
    (0, japa_1.default)('pre-compute urls for newly created images', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container
                .resolveBinding('Adonis/Core/HttpContext')
                .create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(file);
                responsiveAttachment?.setOptions({ preComputeUrls: true, responsiveDimensions: false });
                await responsiveAttachment?.save();
                assert.isTrue(responsiveAttachment?.isPersisted);
                assert.isTrue(responsiveAttachment?.isLocal);
                assert.isNotEmpty(responsiveAttachment?.urls);
                assert.isDefined(responsiveAttachment?.url);
                assert.isNotNull(responsiveAttachment?.url);
                assert.isUndefined(responsiveAttachment?.urls?.breakpoints);
                assert.isTrue(await Drive.exists(responsiveAttachment?.name));
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-825x550.jpg'));
    });
});
japa_1.default.group('Do not generate thumbnail images when `options.disableThumbnail` is true', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('create attachment from the user uploaded image', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(file);
                responsiveAttachment?.setOptions({ disableThumbnail: true });
                await responsiveAttachment?.save();
                assert.isTrue(responsiveAttachment?.isPersisted);
                assert.isTrue(responsiveAttachment?.isLocal);
                assert.isTrue(await Drive.exists(responsiveAttachment?.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.small.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.medium.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.large.name));
                assert.isUndefined(responsiveAttachment?.breakpoints?.thumbnail);
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
    });
    (0, japa_1.default)('pre-compute urls for newly created images', async (assert) => {
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(file);
                responsiveAttachment?.setOptions({ preComputeUrls: true, disableThumbnail: true });
                await responsiveAttachment?.save();
                assert.isTrue(responsiveAttachment?.isPersisted);
                assert.isTrue(responsiveAttachment?.isLocal);
                assert.isNotEmpty(responsiveAttachment?.urls);
                assert.isDefined(responsiveAttachment?.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.small.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.medium.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.large.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.thumbnail);
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
    });
});
japa_1.default.group('Do not generate responsive images when some default breakpoints are `off`', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('create attachment from the user uploaded image', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(file);
                responsiveAttachment?.setOptions({
                    breakpoints: { medium: 'off', small: 'off' },
                });
                await responsiveAttachment?.save();
                assert.isTrue(responsiveAttachment?.isPersisted);
                assert.isTrue(responsiveAttachment?.isLocal);
                assert.isTrue(await Drive.exists(responsiveAttachment?.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.large.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.thumbnail.name));
                assert.isUndefined(responsiveAttachment?.breakpoints?.medium);
                assert.isUndefined(responsiveAttachment?.breakpoints?.small);
                assert.isTrue(responsiveAttachment?.breakpoints.thumbnail.size <
                    responsiveAttachment?.breakpoints.large.size);
                assert.isTrue(responsiveAttachment?.breakpoints.large.size < responsiveAttachment?.size);
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
    });
    (0, japa_1.default)('pre-compute urls for newly created images', async (assert) => {
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(file);
                responsiveAttachment?.setOptions({
                    preComputeUrls: true,
                    breakpoints: { medium: 'off', small: 'off' },
                });
                await responsiveAttachment?.save();
                assert.isTrue(responsiveAttachment?.isPersisted);
                assert.isTrue(responsiveAttachment?.isLocal);
                assert.isNotEmpty(responsiveAttachment?.urls);
                assert.isDefined(responsiveAttachment?.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.large.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.thumbnail.url);
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
    });
});
japa_1.default.group('Manual generation of URLs', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('generate URLs for the images', async (assert) => {
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(file);
                responsiveAttachment?.setOptions({ preComputeUrls: true });
                await responsiveAttachment?.save();
                const urls = await responsiveAttachment?.getUrls();
                assert.isTrue(responsiveAttachment?.isPersisted);
                assert.isTrue(responsiveAttachment?.isLocal);
                assert.match(urls?.url, /^\/uploads\/original.+\?signature=.+$/);
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
    });
});
japa_1.default.group('Error checks', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
});
japa_1.default.group('ResponsiveAttachment | Custom breakpoints', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('create attachment from the user uploaded image', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(file);
                responsiveAttachment?.setOptions({
                    breakpoints: { small: 400, medium: 700, large: 1000, xlarge: 1200 },
                });
                await responsiveAttachment?.save();
                assert.isTrue(responsiveAttachment?.isPersisted);
                assert.isTrue(responsiveAttachment?.isLocal);
                assert.isTrue(await Drive.exists(responsiveAttachment?.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.thumbnail.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.small.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.medium.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.large.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.xlarge.name));
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        assert.isTrue(await Drive.exists(body.name));
        assert.isTrue(await Drive.exists(body.breakpoints?.thumbnail.name));
        assert.isTrue(await Drive.exists(body.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(body.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(body.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(body.breakpoints?.xlarge.name));
    });
    (0, japa_1.default)('pre-compute urls for newly created images', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(file);
                responsiveAttachment?.setOptions({
                    breakpoints: { small: 400, medium: 700, large: 1000, xlarge: 1200 },
                    preComputeUrls: true,
                });
                await responsiveAttachment?.save();
                assert.isTrue(responsiveAttachment?.isPersisted);
                assert.isTrue(responsiveAttachment?.isLocal);
                assert.isDefined(responsiveAttachment?.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.xlarge.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.large.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.medium.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.small.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.thumbnail.url);
                assert.isTrue(await Drive.exists(responsiveAttachment?.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.xlarge.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.large.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.medium.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.small.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.thumbnail.name));
                assert.equal(responsiveAttachment?.width, 1500);
                assert.equal(responsiveAttachment?.breakpoints?.xlarge.width, 1200);
                assert.equal(responsiveAttachment?.breakpoints?.large.width, 1000);
                assert.equal(responsiveAttachment?.breakpoints?.medium.width, 700);
                assert.equal(responsiveAttachment?.breakpoints?.small.width, 400);
                assert.isTrue(responsiveAttachment?.breakpoints?.thumbnail.size <
                    responsiveAttachment?.breakpoints.small.size);
                assert.isTrue(responsiveAttachment?.breakpoints?.small.size <
                    responsiveAttachment?.breakpoints.medium.size);
                assert.isTrue(responsiveAttachment?.breakpoints?.medium.size <
                    responsiveAttachment?.breakpoints.large.size);
                assert.isTrue(responsiveAttachment?.breakpoints?.large.size <
                    responsiveAttachment?.breakpoints?.xlarge.size);
                assert.isTrue(responsiveAttachment?.breakpoints.xlarge.size < responsiveAttachment?.size);
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
    });
});
japa_1.default.group('ResponsiveAttachment | fromBuffer', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('create attachment from the user-provided buffer', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const readableStream = await (0, promises_1.readFile)((0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromBuffer(readableStream);
                await responsiveAttachment.save();
                assert.isTrue(responsiveAttachment.isPersisted);
                assert.isTrue(responsiveAttachment.isLocal);
                assert.isTrue(await Drive.exists(responsiveAttachment?.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.thumbnail.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.small.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.medium.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.large.name));
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server).post('/');
        assert.isTrue(await Drive.exists(body.name));
    });
    (0, japa_1.default)('pre-compute url for newly-created images', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const readableStream = await (0, promises_1.readFile)((0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromBuffer(readableStream);
                responsiveAttachment.setOptions({ preComputeUrls: true });
                await responsiveAttachment.save();
                assert.isTrue(responsiveAttachment.isPersisted);
                assert.isTrue(responsiveAttachment.isLocal);
                assert.isDefined(responsiveAttachment?.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.large.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.medium.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.small.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.thumbnail.url);
                assert.isTrue(await Drive.exists(responsiveAttachment?.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.large.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.medium.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.small.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.thumbnail.name));
                assert.isTrue(responsiveAttachment?.breakpoints.thumbnail.size <
                    responsiveAttachment?.breakpoints.small.size);
                assert.isTrue(responsiveAttachment?.breakpoints.small.size <
                    responsiveAttachment?.breakpoints.medium.size);
                assert.isTrue(responsiveAttachment?.breakpoints.medium.size <
                    responsiveAttachment?.breakpoints.large.size);
                assert.isTrue(responsiveAttachment?.breakpoints.large.size < responsiveAttachment?.size);
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server).post('/');
        assert.isDefined(body.url);
    });
    (0, japa_1.default)('delete local images', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const readableStream = await (0, promises_1.readFile)((0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromBuffer(readableStream);
                responsiveAttachment.setOptions(undefined);
                await responsiveAttachment.save();
                await responsiveAttachment.delete();
                assert.isFalse(responsiveAttachment?.isPersisted);
                assert.isTrue(responsiveAttachment?.isLocal);
                assert.isTrue(responsiveAttachment?.isDeleted);
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server).post('/');
        assert.isFalse(await Drive.exists(body.name));
        assert.isFalse(await Drive.exists(body.breakpoints.large.name));
        assert.isFalse(await Drive.exists(body.breakpoints.medium.name));
        assert.isFalse(await Drive.exists(body.breakpoints.small.name));
        assert.isFalse(await Drive.exists(body.breakpoints.thumbnail.name));
    });
});
japa_1.default.group('ResponsiveAttachment | errors', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('throw error if unallowed file type is provided to `fromBuffer` method', async (assert) => {
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                assert.plan(1);
                const readableStream = await (0, promises_1.readFile)((0, path_1.join)(__dirname, '../unallowed_file.pdf'));
                try {
                    const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromBuffer(readableStream);
                    ctx.response.send(responsiveAttachment);
                    ctx.response.finish();
                }
                catch (error) {
                    assert.equal(error.message, `Uploaded file is not an allowable image. Make sure that you uploaded only the following format: "jpeg", "png", "webp", "tiff", and "avif".`);
                    ctx.response.send(error);
                    ctx.response.finish();
                }
            });
        });
        await (0, supertest_1.default)(server).post('/');
    });
    (0, japa_1.default)('throw error if unallowed file type is provided to `fromFile` method', async (assert) => {
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                assert.plan(1);
                const file = ctx.request.file('avatar');
                try {
                    const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(file);
                    ctx.response.send(responsiveAttachment);
                    ctx.response.finish();
                }
                catch (error) {
                    assert.equal(error.message, `Uploaded file is not an allowable image. Make sure that you uploaded only the following format: "jpeg", "png", "webp", "tiff", and "avif".`);
                    ctx.response.send(error);
                    ctx.response.finish();
                }
            });
        });
        await (0, supertest_1.default)(server).post('/').attach('avatar', (0, path_1.join)(__dirname, '../unallowed_file.pdf'));
    });
    (0, japa_1.default)('throw error if a `falsy` value is provided to `fromFile` method', async (assert) => {
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                assert.plan(1);
                try {
                    const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(undefined);
                    ctx.response.send(responsiveAttachment);
                    ctx.response.finish();
                }
                catch (error) {
                    assert.equal(error.message, 'You should provide a non-falsy value');
                    ctx.response.send(error);
                    ctx.response.finish();
                }
            });
        });
        await (0, supertest_1.default)(server).post('/');
    });
});
japa_1.default.group('Do not generate save original image when `options.keepOriginal` is false', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('create attachment from the user uploaded image', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(file);
                responsiveAttachment?.setOptions({ keepOriginal: false });
                await responsiveAttachment?.save();
                assert.isTrue(responsiveAttachment?.isPersisted);
                assert.isTrue(responsiveAttachment?.isLocal);
                assert.isUndefined(responsiveAttachment?.name);
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.thumbnail.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.small.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.medium.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.large.name));
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        assert.notExists(body.name);
        assert.notExists(body.size);
        assert.notExists(body.hash);
        assert.notExists(body.width);
        assert.notExists(body.format);
        assert.notExists(body.height);
        assert.notExists(body.extname);
        assert.notExists(body.mimeType);
        assert.notExists(body.url);
    });
    (0, japa_1.default)('pre-compute urls for newly-created images', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = app.container.resolveBinding('Adonis/Core/HttpContext').create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const responsiveAttachment = await Attachment_1.ResponsiveAttachment.fromFile(file);
                responsiveAttachment?.setOptions({
                    preComputeUrls: true,
                    keepOriginal: false,
                });
                await responsiveAttachment?.save();
                assert.isTrue(responsiveAttachment?.isPersisted);
                assert.isTrue(responsiveAttachment?.isLocal);
                assert.isUndefined(responsiveAttachment?.url);
                assert.isUndefined(responsiveAttachment?.name);
                assert.isUndefined(responsiveAttachment?.breakpoints?.large.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.medium.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.small.url);
                assert.isUndefined(responsiveAttachment?.breakpoints?.thumbnail.url);
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.large.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.medium.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.small.name));
                assert.isTrue(await Drive.exists(responsiveAttachment?.breakpoints?.thumbnail.name));
                assert.isTrue(responsiveAttachment?.breakpoints.thumbnail.size <
                    responsiveAttachment?.breakpoints.small.size);
                assert.isTrue(responsiveAttachment?.breakpoints.small.size <
                    responsiveAttachment?.breakpoints.medium.size);
                assert.isTrue(responsiveAttachment?.breakpoints.medium.size <
                    responsiveAttachment?.breakpoints.large.size);
                ctx.response.send(responsiveAttachment);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        assert.notExists(body.name);
        assert.notExists(body.size);
        assert.notExists(body.hash);
        assert.notExists(body.width);
        assert.notExists(body.format);
        assert.notExists(body.height);
        assert.notExists(body.extname);
        assert.notExists(body.mimeType);
        assert.notExists(body.url);
    });
});
