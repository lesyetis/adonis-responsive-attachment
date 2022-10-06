"use strict";
/*
 * @ndianabasi/adonis-responsive-attachment
 *
 * (c) Ndianabasi Udonkang <ndianabasi.udonkang@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
const Attachment_1 = require("../src/Attachment");
const decorator_1 = require("../src/Attachment/decorator");
const test_helpers_1 = require("../test-helpers");
const promises_1 = require("fs/promises");
let app;
japa_1.default.group('@responsiveAttachment | insert', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.afterEach(async () => {
        await app.container.resolveBinding('Adonis/Lucid/Database').connection().truncate('users');
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('save attachment to the db and on disk', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const user = new User();
                user.username = 'Ndianabasi';
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                await user.save();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.deepEqual(users[0].avatar?.toJSON(), body.avatar);
        assert.isTrue(await Drive.exists(body.avatar.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.thumbnail.name));
        assert.isTrue(body.avatar.breakpoints?.thumbnail.size < body.avatar.breakpoints?.small.size);
        assert.isTrue(body.avatar.breakpoints?.small.size < body.avatar.breakpoints?.medium.size);
        assert.isTrue(body.avatar.breakpoints?.medium.size < body.avatar.breakpoints?.large.size);
        assert.isTrue(body.avatar.breakpoints?.large.size < body.avatar.size);
        assert.notExists(body.avatar.url);
        assert.notExists(body.avatar.breakpoints?.large.url);
        assert.notExists(body.avatar.breakpoints?.medium.url);
        assert.notExists(body.avatar.breakpoints?.small.url);
        assert.notExists(body.avatar.breakpoints?.thumbnail.url);
    });
    (0, japa_1.default)('cleanup attachments when save call fails', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        await User.create({ username: 'ndianabasi' });
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                try {
                    await user.save();
                }
                catch (error) { }
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.isNull(users[0].avatar);
        assert.isFalse(await Drive.exists(body.avatar.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.large.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.medium.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.small.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.thumbnail.name));
        assert.isTrue(body.avatar.breakpoints?.thumbnail.size < body.avatar.breakpoints?.small.size);
        assert.isTrue(body.avatar.breakpoints?.small.size < body.avatar.breakpoints?.medium.size);
        assert.isTrue(body.avatar.breakpoints?.medium.size < body.avatar.breakpoints?.large.size);
        assert.isTrue(body.avatar.breakpoints?.large.size < body.avatar.size);
        assert.notExists(body.avatar.url);
        assert.notExists(body.avatar.breakpoints?.large.url);
        assert.notExists(body.avatar.breakpoints?.medium.url);
        assert.notExists(body.avatar.breakpoints?.small.url);
        assert.notExists(body.avatar.breakpoints?.thumbnail.url);
    });
});
japa_1.default.group('@responsiveAttachment | insert with transaction', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.afterEach(async () => {
        await app.container.resolveBinding('Adonis/Lucid/Database').connection().truncate('users');
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('save attachment to the db and on disk', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        const Db = app.container.resolveBinding('Adonis/Lucid/Database');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const trx = await Db.transaction();
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                await user.useTransaction(trx).save();
                await trx.commit();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.deepEqual(users[0].avatar?.toJSON(), body.avatar);
        assert.isTrue(await Drive.exists(body.avatar.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.thumbnail.name));
        assert.isTrue(body.avatar.breakpoints?.thumbnail.size < body.avatar.breakpoints?.small.size);
        assert.isTrue(body.avatar.breakpoints?.small.size < body.avatar.breakpoints?.medium.size);
        assert.isTrue(body.avatar.breakpoints?.medium.size < body.avatar.breakpoints?.large.size);
        assert.isTrue(body.avatar.breakpoints?.large.size < body.avatar.size);
        assert.notExists(body.avatar.url);
        assert.notExists(body.avatar.breakpoints?.large.url);
        assert.notExists(body.avatar.breakpoints?.medium.url);
        assert.notExists(body.avatar.breakpoints?.small.url);
        assert.notExists(body.avatar.breakpoints?.thumbnail.url);
    });
    (0, japa_1.default)('cleanup attachments when save call fails', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        const Db = app.container.resolveBinding('Adonis/Lucid/Database');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        await User.create({ username: 'ndianabasi' });
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const trx = await Db.transaction();
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                try {
                    await user.useTransaction(trx).save();
                    await trx.commit();
                }
                catch (error) {
                    await trx.rollback();
                }
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.isNull(users[0].avatar);
        assert.isFalse(await Drive.exists(body.avatar.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.large.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.medium.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.small.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.thumbnail.name));
        assert.isTrue(body.avatar.breakpoints?.thumbnail.size < body.avatar.breakpoints?.small.size);
        assert.isTrue(body.avatar.breakpoints?.small.size < body.avatar.breakpoints?.medium.size);
        assert.isTrue(body.avatar.breakpoints?.medium.size < body.avatar.breakpoints?.large.size);
        assert.isTrue(body.avatar.breakpoints?.large.size < body.avatar.size);
        assert.notExists(body.avatar.url);
        assert.notExists(body.avatar.breakpoints?.large.url);
        assert.notExists(body.avatar.breakpoints?.medium.url);
        assert.notExists(body.avatar.breakpoints?.small.url);
        assert.notExists(body.avatar.breakpoints?.thumbnail.url);
    });
    (0, japa_1.default)('cleanup attachments when rollback is called after success', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        const Db = app.container.resolveBinding('Adonis/Lucid/Database');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const trx = await Db.transaction();
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                await user.useTransaction(trx).save();
                await trx.rollback();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const users = await User.all();
        assert.lengthOf(users, 0);
        assert.isFalse(await Drive.exists(body.avatar.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.large.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.medium.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.small.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.thumbnail.name));
        assert.notExists(body.avatar.url);
        assert.notExists(body.avatar.breakpoints?.large.url);
        assert.notExists(body.avatar.breakpoints?.medium.url);
        assert.notExists(body.avatar.breakpoints?.small.url);
        assert.notExists(body.avatar.breakpoints?.thumbnail.url);
    });
});
japa_1.default.group('@responsiveAttachment | update', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.afterEach(async () => {
        await app.container.resolveBinding('Adonis/Lucid/Database').connection().truncate('users');
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('save attachment to the db and on disk', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const user = await User.firstOrNew({ username: 'ndianabasi' }, {});
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                await user.save();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body: firstResponse } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const { body: secondResponse } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.deepEqual(users[0].avatar?.toJSON(), secondResponse.avatar);
        assert.isFalse(await Drive.exists(firstResponse.avatar.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.large.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.medium.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.small.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.thumbnail.name));
        assert.isTrue(await Drive.exists(secondResponse.avatar.name));
        assert.isTrue(await Drive.exists(secondResponse.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(secondResponse.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(secondResponse.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(secondResponse.avatar.breakpoints?.thumbnail.name));
        assert.notExists(secondResponse.avatar.url);
        assert.notExists(secondResponse.avatar.breakpoints?.large.url);
        assert.notExists(secondResponse.avatar.breakpoints?.medium.url);
        assert.notExists(secondResponse.avatar.breakpoints?.small.url);
        assert.notExists(secondResponse.avatar.breakpoints?.thumbnail.url);
        assert.isTrue(secondResponse.avatar.breakpoints?.thumbnail.size <
            secondResponse.avatar.breakpoints?.small.size);
        assert.isTrue(secondResponse.avatar.breakpoints?.small.size <
            secondResponse.avatar.breakpoints?.medium.size);
        assert.isTrue(secondResponse.avatar.breakpoints?.medium.size <
            secondResponse.avatar.breakpoints?.large.size);
        assert.isTrue(secondResponse.avatar.breakpoints?.large.size < secondResponse.avatar.size);
    });
    (0, japa_1.default)('cleanup attachments when save call fails', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                try {
                    await user.save();
                }
                catch { }
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body: firstResponse } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const { body: secondResponse } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.deepEqual(users[0].avatar?.toJSON(), firstResponse.avatar);
        assert.isTrue(await Drive.exists(firstResponse.avatar.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.thumbnail.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.large.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.medium.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.small.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.thumbnail.name));
        assert.notExists(firstResponse.avatar.url);
        assert.notExists(firstResponse.avatar.breakpoints?.large.url);
        assert.notExists(firstResponse.avatar.breakpoints?.medium.url);
        assert.notExists(firstResponse.avatar.breakpoints?.small.url);
        assert.notExists(firstResponse.avatar.breakpoints?.thumbnail.url);
    });
});
japa_1.default.group('@responsiveAttachment | update with transaction', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.afterEach(async () => {
        await app.container.resolveBinding('Adonis/Lucid/Database').connection().truncate('users');
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('save attachment to the db and on disk', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const Db = app.container.resolveBinding('Adonis/Lucid/Database');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const trx = await Db.transaction();
                const user = await User.firstOrNew({ username: 'ndianabasi' }, {}, { client: trx });
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                await user.save();
                await trx.commit();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body: firstResponse } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const { body: secondResponse } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.deepEqual(users[0].avatar?.toJSON(), secondResponse.avatar);
        assert.isFalse(await Drive.exists(firstResponse.avatar.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.large.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.medium.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.small.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.thumbnail.name));
        assert.isTrue(await Drive.exists(secondResponse.avatar.name));
        assert.isTrue(await Drive.exists(secondResponse.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(secondResponse.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(secondResponse.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(secondResponse.avatar.breakpoints?.thumbnail.name));
        assert.notExists(secondResponse.avatar.url);
        assert.notExists(secondResponse.avatar.breakpoints?.large.url);
        assert.notExists(secondResponse.avatar.breakpoints?.medium.url);
        assert.notExists(secondResponse.avatar.breakpoints?.small.url);
        assert.notExists(secondResponse.avatar.breakpoints?.thumbnail.url);
        assert.isTrue(secondResponse.avatar.breakpoints?.thumbnail.size <
            secondResponse.avatar.breakpoints?.small.size);
        assert.isTrue(secondResponse.avatar.breakpoints?.small.size <
            secondResponse.avatar.breakpoints?.medium.size);
        assert.isTrue(secondResponse.avatar.breakpoints?.medium.size <
            secondResponse.avatar.breakpoints?.large.size);
        assert.isTrue(secondResponse.avatar.breakpoints?.large.size < secondResponse.avatar.size);
    });
    (0, japa_1.default)('cleanup attachments when save call fails', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const Db = app.container.resolveBinding('Adonis/Lucid/Database');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const trx = await Db.transaction();
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                try {
                    await user.useTransaction(trx).save();
                    await trx.commit();
                }
                catch {
                    await trx.rollback();
                }
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body: firstResponse } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const { body: secondResponse } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.deepEqual(users[0].avatar?.toJSON(), firstResponse.avatar);
        assert.isTrue(await Drive.exists(firstResponse.avatar.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.thumbnail.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.large.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.medium.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.small.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.thumbnail.name));
        assert.notExists(firstResponse.avatar.url);
        assert.notExists(firstResponse.avatar.breakpoints?.large.url);
        assert.notExists(firstResponse.avatar.breakpoints?.medium.url);
        assert.notExists(firstResponse.avatar.breakpoints?.small.url);
        assert.notExists(firstResponse.avatar.breakpoints?.thumbnail.url);
        assert.isTrue(firstResponse.avatar.breakpoints?.thumbnail.size <
            firstResponse.avatar.breakpoints?.small.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.small.size < firstResponse.avatar.breakpoints?.medium.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.medium.size < firstResponse.avatar.breakpoints?.large.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.large.size < firstResponse.avatar.size);
    });
    (0, japa_1.default)('cleanup attachments when rollback is called after success', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const Db = app.container.resolveBinding('Adonis/Lucid/Database');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const trx = await Db.transaction();
                const user = await User.firstOrNew({ username: 'ndianabasi' }, {}, { client: trx });
                const isLocal = user.$isLocal;
                user.username = 'ndianabasi';
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                await user.useTransaction(trx).save();
                isLocal ? await trx.commit() : await trx.rollback();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body: firstResponse } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const { body: secondResponse } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.deepEqual(users[0].avatar?.toJSON(), firstResponse.avatar);
        assert.isTrue(await Drive.exists(firstResponse.avatar.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.thumbnail.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.large.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.medium.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.small.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.thumbnail.name));
        assert.notExists(firstResponse.avatar.url);
        assert.notExists(firstResponse.avatar.breakpoints?.large.url);
        assert.notExists(firstResponse.avatar.breakpoints?.medium.url);
        assert.notExists(firstResponse.avatar.breakpoints?.small.url);
        assert.notExists(firstResponse.avatar.breakpoints?.thumbnail.url);
        assert.isTrue(firstResponse.avatar.breakpoints?.thumbnail.size <
            firstResponse.avatar.breakpoints?.small.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.small.size < firstResponse.avatar.breakpoints?.medium.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.medium.size < firstResponse.avatar.breakpoints?.large.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.large.size < firstResponse.avatar.size);
    });
});
japa_1.default.group('@responsiveAttachment | resetToNull', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.afterEach(async () => {
        await app.container.resolveBinding('Adonis/Lucid/Database').connection().truncate('users');
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('save attachment to the db and on disk', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const user = await User.firstOrNew({ username: 'ndianabasi' }, {});
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                await user.save();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body: firstResponse } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        await (0, supertest_1.default)(server).post('/');
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.isNull(users[0].avatar);
        assert.isFalse(await Drive.exists(firstResponse.avatar.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.large.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.medium.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.small.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.thumbnail.name));
        assert.notExists(firstResponse.avatar.url);
        assert.notExists(firstResponse.avatar.breakpoints?.large.url);
        assert.notExists(firstResponse.avatar.breakpoints?.medium.url);
        assert.notExists(firstResponse.avatar.breakpoints?.small.url);
        assert.notExists(firstResponse.avatar.breakpoints?.thumbnail.url);
    });
    (0, japa_1.default)('do not remove old file when resetting to null fails', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                try {
                    await user.save();
                }
                catch { }
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body: firstResponse } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        await (0, supertest_1.default)(server).post('/');
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.deepEqual(users[0].avatar?.toJSON(), firstResponse.avatar);
        assert.isTrue(await Drive.exists(firstResponse.avatar.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.thumbnail.name));
        assert.notExists(firstResponse.avatar.url);
        assert.notExists(firstResponse.avatar.breakpoints?.large.url);
        assert.notExists(firstResponse.avatar.breakpoints?.medium.url);
        assert.notExists(firstResponse.avatar.breakpoints?.small.url);
        assert.notExists(firstResponse.avatar.breakpoints?.thumbnail.url);
        assert.isTrue(firstResponse.avatar.breakpoints?.thumbnail.size <
            firstResponse.avatar.breakpoints?.small.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.small.size < firstResponse.avatar.breakpoints?.medium.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.medium.size < firstResponse.avatar.breakpoints?.large.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.large.size < firstResponse.avatar.size);
    });
});
japa_1.default.group('@responsiveAttachment | resetToNull with transaction', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.afterEach(async () => {
        await app.container.resolveBinding('Adonis/Lucid/Database').connection().truncate('users');
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('save attachment to the db and on disk', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const Db = app.container.resolveBinding('Adonis/Lucid/Database');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const trx = await Db.transaction();
                const user = await User.firstOrNew({ username: 'ndianabasi' }, {}, { client: trx });
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                await user.useTransaction(trx).save();
                await trx.commit();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body: firstResponse } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        await (0, supertest_1.default)(server).post('/');
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.isNull(users[0].avatar);
        assert.isFalse(await Drive.exists(firstResponse.avatar.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.large.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.medium.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.small.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.thumbnail.name));
        assert.notExists(firstResponse.avatar.url);
        assert.notExists(firstResponse.avatar.breakpoints?.large.url);
        assert.notExists(firstResponse.avatar.breakpoints?.medium.url);
        assert.notExists(firstResponse.avatar.breakpoints?.small.url);
        assert.notExists(firstResponse.avatar.breakpoints?.thumbnail.url);
    });
    (0, japa_1.default)('do not remove old file when resetting to null fails', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const Db = app.container.resolveBinding('Adonis/Lucid/Database');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const trx = await Db.transaction();
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                try {
                    await user.useTransaction(trx).save();
                    await trx.commit();
                }
                catch {
                    await trx.rollback();
                }
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body: firstResponse } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        await (0, supertest_1.default)(server).post('/');
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.deepEqual(users[0].avatar?.toJSON(), firstResponse.avatar);
        assert.isTrue(await Drive.exists(firstResponse.avatar.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.thumbnail.name));
        assert.notExists(firstResponse.avatar.url);
        assert.notExists(firstResponse.avatar.breakpoints?.large.url);
        assert.notExists(firstResponse.avatar.breakpoints?.medium.url);
        assert.notExists(firstResponse.avatar.breakpoints?.small.url);
        assert.notExists(firstResponse.avatar.breakpoints?.thumbnail.url);
        assert.isTrue(firstResponse.avatar.breakpoints?.thumbnail.size <
            firstResponse.avatar.breakpoints?.small.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.small.size < firstResponse.avatar.breakpoints?.medium.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.medium.size < firstResponse.avatar.breakpoints?.large.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.large.size < firstResponse.avatar.size);
    });
    (0, japa_1.default)('do not remove old file when rollback was performed after success', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const Db = app.container.resolveBinding('Adonis/Lucid/Database');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const trx = await Db.transaction();
                const user = await User.firstOrNew({ username: 'ndianabasi' }, {}, { client: trx });
                const isLocal = user.$isLocal;
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                await user.useTransaction(trx).save();
                isLocal ? await trx.commit() : await trx.rollback();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body: firstResponse } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        await (0, supertest_1.default)(server).post('/');
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.deepEqual(users[0].avatar?.toJSON(), firstResponse.avatar);
        assert.isTrue(await Drive.exists(firstResponse.avatar.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.thumbnail.name));
        assert.notExists(firstResponse.avatar.url);
        assert.notExists(firstResponse.avatar.breakpoints?.large.url);
        assert.notExists(firstResponse.avatar.breakpoints?.medium.url);
        assert.notExists(firstResponse.avatar.breakpoints?.small.url);
        assert.notExists(firstResponse.avatar.breakpoints?.thumbnail.url);
        assert.isTrue(firstResponse.avatar.breakpoints?.thumbnail.size <
            firstResponse.avatar.breakpoints?.small.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.small.size < firstResponse.avatar.breakpoints?.medium.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.medium.size < firstResponse.avatar.breakpoints?.large.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.large.size < firstResponse.avatar.size);
    });
});
japa_1.default.group('@responsiveAttachment | delete', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.afterEach(async () => {
        await app.container.resolveBinding('Adonis/Lucid/Database').connection().truncate('users');
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('delete attachment when model is deleted', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const user = await User.firstOrNew({ username: 'ndianabasi' }, {});
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                await user.save();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body: firstResponse } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const user = await User.firstOrFail();
        await user.delete();
        const users = await User.all();
        assert.lengthOf(users, 0);
        assert.isFalse(await Drive.exists(firstResponse.avatar.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.large.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.medium.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.small.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.thumbnail.name));
        assert.notExists(firstResponse.avatar.url);
        assert.notExists(firstResponse.avatar.breakpoints?.large.url);
        assert.notExists(firstResponse.avatar.breakpoints?.medium.url);
        assert.notExists(firstResponse.avatar.breakpoints?.small.url);
        assert.notExists(firstResponse.avatar.breakpoints?.thumbnail.url);
    });
    (0, japa_1.default)('do not delete attachment when deletion fails', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        User.before('delete', () => {
            throw new Error('Failed');
        });
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const user = await User.firstOrNew({ username: 'ndianabasi' }, {});
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                await user.save();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const user = await User.firstOrFail();
        try {
            // Failing due to the `User.before('delete') hook`.
            // See above
            await user.delete();
        }
        catch (error) { }
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.deepEqual(users[0].avatar?.toJSON(), body.avatar);
        assert.isTrue(await Drive.exists(body.avatar.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.thumbnail.name));
        assert.isTrue(body.avatar.breakpoints?.thumbnail.size < body.avatar.breakpoints?.small.size);
        assert.isTrue(body.avatar.breakpoints?.small.size < body.avatar.breakpoints?.medium.size);
        assert.isTrue(body.avatar.breakpoints?.medium.size < body.avatar.breakpoints?.large.size);
        assert.isTrue(body.avatar.breakpoints?.large.size < body.avatar.size);
    });
});
japa_1.default.group('@responsiveAttachment | delete with transaction', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.afterEach(async () => {
        await app.container.resolveBinding('Adonis/Lucid/Database').connection().truncate('users');
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('delete attachment when model is deleted', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const Db = app.container.resolveBinding('Adonis/Lucid/Database');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const user = await User.firstOrNew({ username: 'ndianabasi' }, {});
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                await user.save();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body: firstResponse } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const user = await User.firstOrFail();
        const trx = await Db.transaction();
        await user.useTransaction(trx).delete();
        assert.isTrue(await Drive.exists(firstResponse.avatar.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.thumbnail.name));
        assert.notExists(firstResponse.avatar.url);
        assert.notExists(firstResponse.avatar.breakpoints?.large.url);
        assert.notExists(firstResponse.avatar.breakpoints?.medium.url);
        assert.notExists(firstResponse.avatar.breakpoints?.small.url);
        assert.notExists(firstResponse.avatar.breakpoints?.thumbnail.url);
        assert.isTrue(firstResponse.avatar.breakpoints?.thumbnail.size <
            firstResponse.avatar.breakpoints?.small.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.small.size < firstResponse.avatar.breakpoints?.medium.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.medium.size < firstResponse.avatar.breakpoints?.large.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.large.size < firstResponse.avatar.size);
        await trx.commit();
        const users = await User.all();
        assert.lengthOf(users, 0);
        assert.isFalse(await Drive.exists(firstResponse.avatar.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.large.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.medium.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.small.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.thumbnail.name));
    });
    (0, japa_1.default)('do not delete attachment when deletion fails', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const Db = app.container.resolveBinding('Adonis/Lucid/Database');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        User.after('delete', () => {
            throw new Error('Failed');
        });
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const user = await User.firstOrNew({ username: 'ndianabasi' }, {});
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                await user.save();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const user = await User.firstOrFail();
        const trx = await Db.transaction();
        try {
            await user.useTransaction(trx).delete();
        }
        catch {
            assert.isTrue(await Drive.exists(body.avatar.name));
            assert.isTrue(await Drive.exists(body.avatar.breakpoints?.large.name));
            assert.isTrue(await Drive.exists(body.avatar.breakpoints?.medium.name));
            assert.isTrue(await Drive.exists(body.avatar.breakpoints?.small.name));
            assert.isTrue(await Drive.exists(body.avatar.breakpoints?.thumbnail.name));
            await trx.rollback();
        }
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.deepEqual(users[0].avatar?.toJSON(), body.avatar);
        assert.isTrue(await Drive.exists(body.avatar.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.thumbnail.name));
        assert.isTrue(body.avatar.breakpoints?.thumbnail.size < body.avatar.breakpoints?.small.size);
        assert.isTrue(body.avatar.breakpoints?.small.size < body.avatar.breakpoints?.medium.size);
        assert.isTrue(body.avatar.breakpoints?.medium.size < body.avatar.breakpoints?.large.size);
        assert.isTrue(body.avatar.breakpoints?.large.size < body.avatar.size);
    });
});
japa_1.default.group('@responsiveAttachment | find', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.afterEach(async () => {
        await app.container.resolveBinding('Adonis/Lucid/Database').connection().truncate('users');
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('pre-compute urls on find', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)({ preComputeUrls: true }),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                await user.save();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const user = await User.firstOrFail();
        assert.instanceOf(user.avatar, Attachment_1.ResponsiveAttachment);
        assert.isDefined(user.avatar?.urls);
        assert.isUndefined(user.avatar?.breakpoints?.large.url);
        assert.isUndefined(user.avatar?.breakpoints?.medium.url);
        assert.isUndefined(user.avatar?.breakpoints?.small.url);
        assert.isUndefined(user.avatar?.breakpoints?.thumbnail.url);
        assert.isDefined(body.avatar.url);
        assert.isDefined(body.avatar?.breakpoints?.large.url);
        assert.isDefined(body.avatar?.breakpoints?.medium.url);
        assert.isDefined(body.avatar?.breakpoints?.small.url);
        assert.isDefined(body.avatar?.breakpoints?.thumbnail.url);
        assert.isTrue(await Drive.exists(body.avatar.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.thumbnail.name));
        assert.isTrue(body.avatar.breakpoints?.thumbnail.size < body.avatar.breakpoints?.small.size);
        assert.isTrue(body.avatar.breakpoints?.small.size < body.avatar.breakpoints?.medium.size);
        assert.isTrue(body.avatar.breakpoints?.medium.size < body.avatar.breakpoints?.large.size);
        assert.isTrue(body.avatar.breakpoints?.large.size < body.avatar.size);
    });
    (0, japa_1.default)('do not pre-compute when preComputeUrls is not enabled', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                await user.save();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const user = await User.firstOrFail();
        assert.instanceOf(user.avatar, Attachment_1.ResponsiveAttachment);
        assert.isUndefined(user.avatar?.urls);
        assert.isUndefined(body.avatar.url);
        assert.isTrue(await Drive.exists(body.avatar.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.thumbnail.name));
        assert.isTrue(body.avatar.breakpoints?.thumbnail.size < body.avatar.breakpoints?.small.size);
        assert.isTrue(body.avatar.breakpoints?.small.size < body.avatar.breakpoints?.medium.size);
        assert.isTrue(body.avatar.breakpoints?.medium.size < body.avatar.breakpoints?.large.size);
        assert.isTrue(body.avatar.breakpoints?.large.size < body.avatar.size);
    });
});
japa_1.default.group('@responsiveAttachment | fetch', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.afterEach(async () => {
        await app.container.resolveBinding('Adonis/Lucid/Database').connection().truncate('users');
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('pre-compute urls on fetch', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)({ preComputeUrls: true }),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                await user.save();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const users = await User.all();
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.isDefined(users[0].avatar?.urls);
        assert.isUndefined(users[0].avatar?.breakpoints?.large.url);
        assert.isUndefined(users[0].avatar?.breakpoints?.medium.url);
        assert.isUndefined(users[0].avatar?.breakpoints?.small.url);
        assert.isUndefined(users[0].avatar?.breakpoints?.thumbnail.url);
        assert.isDefined(body.avatar.url);
        assert.isDefined(body.avatar?.breakpoints?.large.url);
        assert.isDefined(body.avatar?.breakpoints?.medium.url);
        assert.isDefined(body.avatar?.breakpoints?.small.url);
        assert.isDefined(body.avatar?.breakpoints?.thumbnail.url);
        assert.isTrue(await Drive.exists(body.avatar.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.thumbnail.name));
        assert.isTrue(body.avatar.breakpoints?.thumbnail.size < body.avatar.breakpoints?.small.size);
        assert.isTrue(body.avatar.breakpoints?.small.size < body.avatar.breakpoints?.medium.size);
        assert.isTrue(body.avatar.breakpoints?.medium.size < body.avatar.breakpoints?.large.size);
        assert.isTrue(body.avatar.breakpoints?.large.size < body.avatar.size);
    });
    (0, japa_1.default)('do not pre-compute when preComputeUrls is not enabled', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                await user.save();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const users = await User.all();
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.isUndefined(users[0].avatar?.urls);
        assert.isUndefined(body.avatar.url);
        assert.isTrue(await Drive.exists(body.avatar.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.thumbnail.name));
        assert.isTrue(body.avatar.breakpoints?.thumbnail.size < body.avatar.breakpoints?.small.size);
        assert.isTrue(body.avatar.breakpoints?.small.size < body.avatar.breakpoints?.medium.size);
        assert.isTrue(body.avatar.breakpoints?.medium.size < body.avatar.breakpoints?.large.size);
        assert.isTrue(body.avatar.breakpoints?.large.size < body.avatar.size);
    });
});
japa_1.default.group('@responsiveAttachment | paginate', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.afterEach(async () => {
        await app.container.resolveBinding('Adonis/Lucid/Database').connection().truncate('users');
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('pre-compute urls on paginate', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)({ preComputeUrls: true }),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                await user.save();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const users = await User.query().paginate(1);
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.isDefined(users[0].avatar?.urls);
        assert.isUndefined(users[0].avatar?.breakpoints?.large.url);
        assert.isUndefined(users[0].avatar?.breakpoints?.medium.url);
        assert.isUndefined(users[0].avatar?.breakpoints?.small.url);
        assert.isUndefined(users[0].avatar?.breakpoints?.thumbnail.url);
        assert.isDefined(body.avatar.url);
        assert.isDefined(body.avatar?.breakpoints?.large.url);
        assert.isDefined(body.avatar?.breakpoints?.medium.url);
        assert.isDefined(body.avatar?.breakpoints?.small.url);
        assert.isDefined(body.avatar?.breakpoints?.thumbnail.url);
        assert.isTrue(await Drive.exists(body.avatar.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.thumbnail.name));
        assert.isTrue(body.avatar.breakpoints?.thumbnail.size < body.avatar.breakpoints?.small.size);
        assert.isTrue(body.avatar.breakpoints?.small.size < body.avatar.breakpoints?.medium.size);
        assert.isTrue(body.avatar.breakpoints?.medium.size < body.avatar.breakpoints?.large.size);
        assert.isTrue(body.avatar.breakpoints?.large.size < body.avatar.size);
    });
    (0, japa_1.default)('do not pre-compute when preComputeUrls is not enabled', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const file = ctx.request.file('avatar');
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = file ? await Attachment_1.ResponsiveAttachment.fromFile(file) : null;
                await user.save();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server)
            .post('/')
            .attach('avatar', (0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
        const users = await User.query().paginate(1);
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.isUndefined(users[0].avatar?.urls);
        assert.isUndefined(body.avatar.url);
        assert.isTrue(await Drive.exists(body.avatar.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.thumbnail.name));
        assert.isTrue(body.avatar.breakpoints?.thumbnail.size < body.avatar.breakpoints?.small.size);
        assert.isTrue(body.avatar.breakpoints?.small.size < body.avatar.breakpoints?.medium.size);
        assert.isTrue(body.avatar.breakpoints?.medium.size < body.avatar.breakpoints?.large.size);
        assert.isTrue(body.avatar.breakpoints?.large.size < body.avatar.size);
    });
});
japa_1.default.group('@responsiveAttachment | fromBuffer | insert', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.afterEach(async () => {
        await app.container.resolveBinding('Adonis/Lucid/Database').connection().truncate('users');
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('save attachment to the db and on disk', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const buffer = await (0, promises_1.readFile)((0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = await Attachment_1.ResponsiveAttachment.fromBuffer(buffer);
                await user.save();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server).post('/');
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.deepEqual(users[0].avatar?.toJSON(), body.avatar);
        assert.isTrue(await Drive.exists(body.avatar.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.thumbnail.name));
        assert.isTrue(body.avatar.breakpoints?.thumbnail.size < body.avatar.breakpoints?.small.size);
        assert.isTrue(body.avatar.breakpoints?.small.size < body.avatar.breakpoints?.medium.size);
        assert.isTrue(body.avatar.breakpoints?.medium.size < body.avatar.breakpoints?.large.size);
        assert.isTrue(body.avatar.breakpoints?.large.size < body.avatar.size);
        assert.notExists(body.avatar.url);
        assert.notExists(body.avatar.breakpoints?.large.url);
        assert.notExists(body.avatar.breakpoints?.medium.url);
        assert.notExists(body.avatar.breakpoints?.small.url);
        assert.notExists(body.avatar.breakpoints?.thumbnail.url);
    });
    (0, japa_1.default)('cleanup attachments when save call fails', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        await User.create({ username: 'ndianabasi' });
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const buffer = await (0, promises_1.readFile)((0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = await Attachment_1.ResponsiveAttachment.fromBuffer(buffer);
                try {
                    await user.save();
                }
                catch (error) { }
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server).post('/');
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.isNull(users[0].avatar);
        assert.isFalse(await Drive.exists(body.avatar.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.large.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.medium.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.small.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.thumbnail.name));
        assert.isTrue(body.avatar.breakpoints?.thumbnail.size < body.avatar.breakpoints?.small.size);
        assert.isTrue(body.avatar.breakpoints?.small.size < body.avatar.breakpoints?.medium.size);
        assert.isTrue(body.avatar.breakpoints?.medium.size < body.avatar.breakpoints?.large.size);
        assert.isTrue(body.avatar.breakpoints?.large.size < body.avatar.size);
        assert.notExists(body.avatar.url);
        assert.notExists(body.avatar.breakpoints?.large.url);
        assert.notExists(body.avatar.breakpoints?.medium.url);
        assert.notExists(body.avatar.breakpoints?.small.url);
        assert.notExists(body.avatar.breakpoints?.thumbnail.url);
    });
});
japa_1.default.group('@responsiveAttachment | fromBuffer | insert with transaction', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.afterEach(async () => {
        await app.container.resolveBinding('Adonis/Lucid/Database').connection().truncate('users');
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('save attachment to the db and on disk', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        const Db = app.container.resolveBinding('Adonis/Lucid/Database');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const buffer = await (0, promises_1.readFile)((0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
                const trx = await Db.transaction();
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = await Attachment_1.ResponsiveAttachment.fromBuffer(buffer);
                await user.useTransaction(trx).save();
                await trx.commit();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server).post('/');
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.deepEqual(users[0].avatar?.toJSON(), body.avatar);
        assert.isTrue(await Drive.exists(body.avatar.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(body.avatar.breakpoints?.thumbnail.name));
        assert.isTrue(body.avatar.breakpoints?.thumbnail.size < body.avatar.breakpoints?.small.size);
        assert.isTrue(body.avatar.breakpoints?.small.size < body.avatar.breakpoints?.medium.size);
        assert.isTrue(body.avatar.breakpoints?.medium.size < body.avatar.breakpoints?.large.size);
        assert.isTrue(body.avatar.breakpoints?.large.size < body.avatar.size);
        assert.notExists(body.avatar.url);
        assert.notExists(body.avatar.breakpoints?.large.url);
        assert.notExists(body.avatar.breakpoints?.medium.url);
        assert.notExists(body.avatar.breakpoints?.small.url);
        assert.notExists(body.avatar.breakpoints?.thumbnail.url);
    });
    (0, japa_1.default)('cleanup attachments when save call fails', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        const Db = app.container.resolveBinding('Adonis/Lucid/Database');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        await User.create({ username: 'ndianabasi' });
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const buffer = await (0, promises_1.readFile)((0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
                const trx = await Db.transaction();
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = await Attachment_1.ResponsiveAttachment.fromBuffer(buffer);
                try {
                    await user.useTransaction(trx).save();
                    await trx.commit();
                }
                catch (error) {
                    await trx.rollback();
                }
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server).post('/');
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.isNull(users[0].avatar);
        assert.isFalse(await Drive.exists(body.avatar.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.large.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.medium.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.small.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.thumbnail.name));
        assert.isTrue(body.avatar.breakpoints?.thumbnail.size < body.avatar.breakpoints?.small.size);
        assert.isTrue(body.avatar.breakpoints?.small.size < body.avatar.breakpoints?.medium.size);
        assert.isTrue(body.avatar.breakpoints?.medium.size < body.avatar.breakpoints?.large.size);
        assert.isTrue(body.avatar.breakpoints?.large.size < body.avatar.size);
        assert.notExists(body.avatar.url);
        assert.notExists(body.avatar.breakpoints?.large.url);
        assert.notExists(body.avatar.breakpoints?.medium.url);
        assert.notExists(body.avatar.breakpoints?.small.url);
        assert.notExists(body.avatar.breakpoints?.thumbnail.url);
    });
    (0, japa_1.default)('cleanup attachments when rollback is called after success', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        const Db = app.container.resolveBinding('Adonis/Lucid/Database');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const buffer = await (0, promises_1.readFile)((0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
                const trx = await Db.transaction();
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = await Attachment_1.ResponsiveAttachment.fromBuffer(buffer);
                await user.useTransaction(trx).save();
                await trx.rollback();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body } = await (0, supertest_1.default)(server).post('/');
        const users = await User.all();
        assert.lengthOf(users, 0);
        assert.isFalse(await Drive.exists(body.avatar.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.large.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.medium.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.small.name));
        assert.isFalse(await Drive.exists(body.avatar.breakpoints?.thumbnail.name));
        assert.notExists(body.avatar.url);
        assert.notExists(body.avatar.breakpoints?.large.url);
        assert.notExists(body.avatar.breakpoints?.medium.url);
        assert.notExists(body.avatar.breakpoints?.small.url);
        assert.notExists(body.avatar.breakpoints?.thumbnail.url);
    });
});
japa_1.default.group('@responsiveAttachment | fromBuffer | update', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.afterEach(async () => {
        await app.container.resolveBinding('Adonis/Lucid/Database').connection().truncate('users');
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('save attachment to the db and on disk', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const buffer = await (0, promises_1.readFile)((0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
                const user = await User.firstOrNew({ username: 'ndianabasi' }, {});
                user.avatar = await Attachment_1.ResponsiveAttachment.fromBuffer(buffer);
                await user.save();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body: firstResponse } = await (0, supertest_1.default)(server).post('/');
        const { body: secondResponse } = await (0, supertest_1.default)(server).post('/');
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.deepEqual(users[0].avatar?.toJSON(), secondResponse.avatar);
        assert.isFalse(await Drive.exists(firstResponse.avatar.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.large.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.medium.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.small.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.thumbnail.name));
        assert.isTrue(await Drive.exists(secondResponse.avatar.name));
        assert.isTrue(await Drive.exists(secondResponse.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(secondResponse.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(secondResponse.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(secondResponse.avatar.breakpoints?.thumbnail.name));
        assert.notExists(secondResponse.avatar.url);
        assert.notExists(secondResponse.avatar.breakpoints?.large.url);
        assert.notExists(secondResponse.avatar.breakpoints?.medium.url);
        assert.notExists(secondResponse.avatar.breakpoints?.small.url);
        assert.notExists(secondResponse.avatar.breakpoints?.thumbnail.url);
        assert.isTrue(secondResponse.avatar.breakpoints?.thumbnail.size <
            secondResponse.avatar.breakpoints?.small.size);
        assert.isTrue(secondResponse.avatar.breakpoints?.small.size <
            secondResponse.avatar.breakpoints?.medium.size);
        assert.isTrue(secondResponse.avatar.breakpoints?.medium.size <
            secondResponse.avatar.breakpoints?.large.size);
        assert.isTrue(secondResponse.avatar.breakpoints?.large.size < secondResponse.avatar.size);
    });
    (0, japa_1.default)('cleanup attachments when save call fails', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const buffer = await (0, promises_1.readFile)((0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = await Attachment_1.ResponsiveAttachment.fromBuffer(buffer);
                try {
                    await user.save();
                }
                catch { }
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body: firstResponse } = await (0, supertest_1.default)(server).post('/');
        const { body: secondResponse } = await (0, supertest_1.default)(server).post('/');
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.deepEqual(users[0].avatar?.toJSON(), firstResponse.avatar);
        assert.isTrue(await Drive.exists(firstResponse.avatar.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.thumbnail.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.large.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.medium.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.small.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.thumbnail.name));
        assert.notExists(firstResponse.avatar.url);
        assert.notExists(firstResponse.avatar.breakpoints?.large.url);
        assert.notExists(firstResponse.avatar.breakpoints?.medium.url);
        assert.notExists(firstResponse.avatar.breakpoints?.small.url);
        assert.notExists(firstResponse.avatar.breakpoints?.thumbnail.url);
    });
});
japa_1.default.group('@responsiveAttachment | fromBuffer | update with transaction', (group) => {
    group.before(async () => {
        app = await (0, test_helpers_1.setupApplication)();
        await (0, test_helpers_1.setup)(app);
        app.container.resolveBinding('Adonis/Core/Route').commit();
        Attachment_1.ResponsiveAttachment.setDrive(app.container.resolveBinding('Adonis/Core/Drive'));
    });
    group.afterEach(async () => {
        await app.container.resolveBinding('Adonis/Lucid/Database').connection().truncate('users');
    });
    group.after(async () => {
        await (0, test_helpers_1.cleanup)(app);
    });
    (0, japa_1.default)('save attachment to the db and on disk', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const Db = app.container.resolveBinding('Adonis/Lucid/Database');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const buffer = await (0, promises_1.readFile)((0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
                const trx = await Db.transaction();
                const user = await User.firstOrNew({ username: 'ndianabasi' }, {}, { client: trx });
                user.avatar = await Attachment_1.ResponsiveAttachment.fromBuffer(buffer);
                await user.save();
                await trx.commit();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body: firstResponse } = await (0, supertest_1.default)(server).post('/');
        const { body: secondResponse } = await (0, supertest_1.default)(server).post('/');
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.deepEqual(users[0].avatar?.toJSON(), secondResponse.avatar);
        assert.isFalse(await Drive.exists(firstResponse.avatar.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.large.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.medium.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.small.name));
        assert.isFalse(await Drive.exists(firstResponse.avatar.breakpoints?.thumbnail.name));
        assert.isTrue(await Drive.exists(secondResponse.avatar.name));
        assert.isTrue(await Drive.exists(secondResponse.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(secondResponse.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(secondResponse.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(secondResponse.avatar.breakpoints?.thumbnail.name));
        assert.notExists(secondResponse.avatar.url);
        assert.notExists(secondResponse.avatar.breakpoints?.large.url);
        assert.notExists(secondResponse.avatar.breakpoints?.medium.url);
        assert.notExists(secondResponse.avatar.breakpoints?.small.url);
        assert.notExists(secondResponse.avatar.breakpoints?.thumbnail.url);
        assert.isTrue(secondResponse.avatar.breakpoints?.thumbnail.size <
            secondResponse.avatar.breakpoints?.small.size);
        assert.isTrue(secondResponse.avatar.breakpoints?.small.size <
            secondResponse.avatar.breakpoints?.medium.size);
        assert.isTrue(secondResponse.avatar.breakpoints?.medium.size <
            secondResponse.avatar.breakpoints?.large.size);
        assert.isTrue(secondResponse.avatar.breakpoints?.large.size < secondResponse.avatar.size);
    });
    (0, japa_1.default)('cleanup attachments when save call fails', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const Db = app.container.resolveBinding('Adonis/Lucid/Database');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const buffer = await (0, promises_1.readFile)((0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
                const trx = await Db.transaction();
                const user = new User();
                user.username = 'ndianabasi';
                user.avatar = await Attachment_1.ResponsiveAttachment.fromBuffer(buffer);
                try {
                    await user.useTransaction(trx).save();
                    await trx.commit();
                }
                catch {
                    await trx.rollback();
                }
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body: firstResponse } = await (0, supertest_1.default)(server).post('/');
        const { body: secondResponse } = await (0, supertest_1.default)(server).post('/');
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.deepEqual(users[0].avatar?.toJSON(), firstResponse.avatar);
        assert.isTrue(await Drive.exists(firstResponse.avatar.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.thumbnail.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.large.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.medium.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.small.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.thumbnail.name));
        assert.notExists(firstResponse.avatar.url);
        assert.notExists(firstResponse.avatar.breakpoints?.large.url);
        assert.notExists(firstResponse.avatar.breakpoints?.medium.url);
        assert.notExists(firstResponse.avatar.breakpoints?.small.url);
        assert.notExists(firstResponse.avatar.breakpoints?.thumbnail.url);
        assert.isTrue(firstResponse.avatar.breakpoints?.thumbnail.size <
            firstResponse.avatar.breakpoints?.small.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.small.size < firstResponse.avatar.breakpoints?.medium.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.medium.size < firstResponse.avatar.breakpoints?.large.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.large.size < firstResponse.avatar.size);
    });
    (0, japa_1.default)('cleanup attachments when rollback is called after success', async (assert) => {
        const Drive = app.container.resolveBinding('Adonis/Core/Drive');
        const Db = app.container.resolveBinding('Adonis/Lucid/Database');
        const { column, BaseModel } = app.container.use('Adonis/Lucid/Orm');
        const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext');
        class User extends BaseModel {
        }
        __decorate([
            column({ isPrimary: true }),
            __metadata("design:type", String)
        ], User.prototype, "id", void 0);
        __decorate([
            column(),
            __metadata("design:type", String)
        ], User.prototype, "username", void 0);
        __decorate([
            (0, decorator_1.responsiveAttachment)(),
            __metadata("design:type", Object)
        ], User.prototype, "avatar", void 0);
        const server = (0, http_1.createServer)((req, res) => {
            const ctx = HttpContext.create('/', {}, req, res);
            app.container.make(BodyParser_1.BodyParserMiddleware).handle(ctx, async () => {
                const buffer = await (0, promises_1.readFile)((0, path_1.join)(__dirname, '../Statue-of-Sardar-Vallabhbhai-Patel-1500x1000.jpg'));
                const trx = await Db.transaction();
                const user = await User.firstOrNew({ username: 'ndianabasi' }, {}, { client: trx });
                const isLocal = user.$isLocal;
                user.username = 'ndianabasi';
                user.avatar = await Attachment_1.ResponsiveAttachment.fromBuffer(buffer);
                await user.useTransaction(trx).save();
                isLocal ? await trx.commit() : await trx.rollback();
                ctx.response.send(user);
                ctx.response.finish();
            });
        });
        const { body: firstResponse } = await (0, supertest_1.default)(server).post('/');
        const { body: secondResponse } = await (0, supertest_1.default)(server).post('/');
        const users = await User.all();
        assert.lengthOf(users, 1);
        assert.instanceOf(users[0].avatar, Attachment_1.ResponsiveAttachment);
        assert.deepEqual(users[0].avatar?.toJSON(), firstResponse.avatar);
        assert.isTrue(await Drive.exists(firstResponse.avatar.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.large.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.medium.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.small.name));
        assert.isTrue(await Drive.exists(firstResponse.avatar.breakpoints?.thumbnail.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.large.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.medium.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.small.name));
        assert.isFalse(await Drive.exists(secondResponse.avatar.breakpoints?.thumbnail.name));
        assert.notExists(firstResponse.avatar.url);
        assert.notExists(firstResponse.avatar.breakpoints?.large.url);
        assert.notExists(firstResponse.avatar.breakpoints?.medium.url);
        assert.notExists(firstResponse.avatar.breakpoints?.small.url);
        assert.notExists(firstResponse.avatar.breakpoints?.thumbnail.url);
        assert.isTrue(firstResponse.avatar.breakpoints?.thumbnail.size <
            firstResponse.avatar.breakpoints?.small.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.small.size < firstResponse.avatar.breakpoints?.medium.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.medium.size < firstResponse.avatar.breakpoints?.large.size);
        assert.isTrue(firstResponse.avatar.breakpoints?.large.size < firstResponse.avatar.size);
    });
});
