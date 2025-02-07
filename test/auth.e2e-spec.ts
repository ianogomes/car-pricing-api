import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication System', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup request', () => {
    const TestingEmail = 'test4@email.com';

    return request(app.getHttpServer()) // pretends to receive a request
      .post('/auth/signup') // customization of the request
      .send({ email: TestingEmail, password: 'pass' })
      .expect(201) //expectations
      .then((res) => {
        const { id, email } = res.body;
        console.log(email);
        expect(id).toBeDefined();
        expect(email).toEqual(TestingEmail);
      });
  });

  it('signup as a new user then get the currently logged in user', async () => {
    const TestingEmail = 'test@email.com';

    // signup
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: TestingEmail, password: 'pass' })
      .expect(201);

    // getting cookie from the signup
    const cookie = res.get('Set-Cookie');

    // checking signed user
    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.email).toEqual(TestingEmail);
  });
});
