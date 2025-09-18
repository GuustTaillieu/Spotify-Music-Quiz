import { faker } from "@faker-js/faker";

import {
  notificationsTable,
  Quiz,
  quizAttendeesTable,
  quizesTable,
  userFollowsTable,
  usersTable,
} from "./schema";

import { db } from ".";

async function seed() {
  // Create other users and quizes
  for (let i = 0; i < 100; i++) {
    // Creates fake users
    const generatedUsers = Array.from({ length: 5 }).map(() => ({
      name: faker.person.fullName(),
      spotifyId: faker.string.uuid(),
      imageUrl: faker.image.avatar(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    const users = await db
      .insert(usersTable)
      .values(generatedUsers)
      .returning();

    const postUser = users[0];

    // Creates fake quizes
    const generatedQuizes = Array.from({ length: 5 }).map(
      (_, i) =>
        ({
          title: faker.lorem.slug(),
          userId: postUser.id,
          imageUrl: faker.image.avatar(),
          public: i < 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }) as Quiz,
    );
    const quizes = await db
      .insert(quizesTable)
      .values(generatedQuizes)
      .returning();

    // Add random attendees to quizes and create notifications
    for (const quiz of quizes) {
      // Each experience will have between 0 and 20 random attendees
      const numberOfAttendees = Math.floor(Math.random() * 21);
      const shuffledUsers = [...users].sort(() => Math.random() - 0.5);

      for (let i = 0; i < numberOfAttendees && i < shuffledUsers.length; i++) {
        const attendee = shuffledUsers[i];

        // Don't attend your own experience
        if (attendee.id === quiz.userId) {
          continue;
        }

        try {
          const [attendeeRecord] = await db
            .insert(quizAttendeesTable)
            .values({
              quizId: quiz.id,
              userId: attendee.id,
              createdAt: faker.date
                .between({
                  from: quiz.createdAt,
                  to: new Date(),
                })
                .toISOString(),
            })
            .returning();

          // Create notification for the experience user
          await db.insert(notificationsTable).values({
            type: "user_attending_quiz",
            quizId: quiz.id,
            userId: quiz.userId,
            fromUserId: attendee.id,
            createdAt: attendeeRecord.createdAt,
          });
        } catch {
          // Ignore duplicate attendees
          continue;
        }
      }
    }

    // Add random follows between users
    // Each user will follow between 5-15 random users
    for (const user of users) {
      const numberOfFollows = Math.floor(Math.random() * 11) + 5; // Random number between 5-15
      const shuffledUsers = [...users].sort(() => Math.random() - 0.5);

      for (let i = 0; i < numberOfFollows && i < shuffledUsers.length; i++) {
        const userToFollow = shuffledUsers[i];

        // Don't follow yourself
        if (userToFollow.id === user.id) {
          continue;
        }

        try {
          await db.insert(userFollowsTable).values({
            followerId: user.id,
            followingId: userToFollow.id,
            createdAt: faker.date
              .between({
                from: user.createdAt,
                to: new Date(),
              })
              .toISOString(),
          });

          // Create notification for the user being followed
          await db.insert(notificationsTable).values({
            type: "user_followed_user",
            fromUserId: user.id,
            userId: userToFollow.id,
            createdAt: new Date().toISOString(),
          });
        } catch {
          // Ignore duplicate follows
          continue;
        }
      }
    }
  }
}

seed();
