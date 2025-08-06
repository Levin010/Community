// import { verifyWebhook } from '@clerk/nextjs/webhooks'
// import { NextRequest } from 'next/server'
// import prisma from "@/lib/client";


// export async function POST(req: NextRequest) {
//   try {
//     const evt = await verifyWebhook(req)

//     const { id } = evt.data
//     const eventType = evt.type

//     if (eventType === "user.created") {
//         try {
//         await prisma.user.create({
//             data: {
//             id: evt.data.id,
//             username: JSON.parse(body).data.username,
//             avatar: JSON.parse(body).data.image_url || "/noAvatar.png",
//             cover: "/noCover.png",
//             },
//         });
//         return new Response("User has been created!", { status: 200 });
//         } catch (err) {
//         console.log(err);
//         return new Response("Failed to create the user!", { status: 500 });
//         }
//     }
//     if (eventType === "user.updated") {
//         try {
//         await prisma.user.update({
//             where: {
//             id: evt.data.id,
//             },
//             data: {
//             username: JSON.parse(body).data.username,
//             avatar: JSON.parse(body).data.image_url || "/noAvatar.png",
//             },
//         });
//         return new Response("User has been updated!", { status: 200 });
//         } catch (err) {
//         console.log(err);
//         return new Response("Failed to update the user!", { status: 500 });
//         }
//     }

//     return new Response('Webhook received', { status: 200 })
//   } catch (err) {
//     console.error('Error verifying webhook:', err)
//     return new Response('Error verifying webhook', { status: 400 })
//   }
// }

import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'
import prisma from "@/lib/client";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)

    const { id } = evt.data
    const eventType = evt.type
    
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
    console.log('Webhook payload:', evt.data)

    if (eventType === "user.created") {
      try {
        await prisma.user.create({
          data: {
            id: evt.data.id,
            username: evt.data.username || evt.data.first_name || "Anonymous",
            avatar: evt.data.image_url || "/noAvatar.png",
            cover: "/noCover.png",
          },
        });
        console.log("User created successfully in database");
        return new Response("User has been created!", { status: 200 });
      } catch (err) {
        console.log("Error creating user:", err);
        return new Response("Failed to create the user!", { status: 500 });
      }
    }

    if (eventType === "user.updated") {
      try {
        await prisma.user.update({
          where: {
            id: evt.data.id,
          },
          data: {
            username: evt.data.username || evt.data.first_name || "Anonymous",
            avatar: evt.data.image_url || "/noAvatar.png",
          },
        });
        console.log("User updated successfully in database");
        return new Response("User has been updated!", { status: 200 });
      } catch (err) {
        console.log("Error updating user:", err);
        return new Response("Failed to update the user!", { status: 500 });
      }
    }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}