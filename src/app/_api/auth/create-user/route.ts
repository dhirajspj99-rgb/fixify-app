import { NextResponse } from "next/server";
import { Server as ServerIO } from "socket.io";

// Global reference taaki server reload hone par socket pool crash na ho
declare global {
  var io: ServerIO | undefined;
}

export async function GET(req: Request) {
  // Next.js ke internal HTTP server instance ko capture karna
  // @ts-ignore
  const socketServer = (global as any).server || (req as any).socket?.server;

  if (!global.io && socketServer) {
    console.log("🚀 Fixify Socket Server Running with Free Calling, Chat & Notifications...");
    
    const io = new ServerIO(socketServer, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*", // Sabhi platforms/dashboards se socket handle karne ke liye
      },
    });

    io.on("connection", (socket) => {
      console.log(`➡️ User Connected Successfully: ${socket.id}`);

      // ==========================================================
      // 1. 100% FREE WEB-RTC CALLING LOGIC
      // ==========================================================
      
      // Customer ya Admin ko common call room me join karwane ke liye
      socket.on("join-room", (roomID: string) => {
        socket.join(roomID);
        console.log(`📞 User linked to call room: ${roomID}`);
      });

      // WebRTC audio signals (Offer, Answer, ICE Candidates) ko route karne ke liye
      socket.on("signal", (data: any) => {
        if (data.roomID) {
          socket.to(data.roomID).emit("signal", data);
        }
      });


      // ==========================================================
      // 2. CHAT & MESSAGE LOGIC (FUNCTION ALIVE)
      // ==========================================================
      
      // Jab customer ya admin live helpdesk ya order panel par chat message bhejenge
      socket.on("chat-message", (msgData: any) => {
        console.log("💬 New Live Chat Message:", msgData);
        if (msgData.roomID) {
          // Room me baaki sabhi users ko instant message deliver karna
          socket.to(msgData.roomID).emit("chat-message-received", msgData);
        } else {
          // Global broad-cast backup
          socket.broadcast.emit("chat-message-received", msgData);
        }
      });


      // ==========================================================
      // 3. REALTIME NOTIFICATION & ORDER UPDATE LOGIC
      // ==========================================================
      
      // Supabase background alerts aur custom alert notifications ke liye
      socket.on("send-notification", (notificationData: any) => {
        console.log("🔔 New Notification Broadcasted:", notificationData);
        // Poore app me sabhi users (ya target user) ko live popup notification trigger karna
        socket.broadcast.emit("notification-received", notificationData);
      });

      // Order updates ya order tab me state refresh karwane ka function
      socket.on("order-update", (orderData: any) => {
        console.log("📦 Order State Changed:", orderData);
        socket.broadcast.emit("order-state-refreshed", orderData);
      });


      // ==========================================================
      // DISCONNECT CONNECTION
      // ==========================================================
      socket.on("disconnect", () => {
        console.log(`⬅️ User Separated from Session: ${socket.id}`);
      });
    });

    global.io = io;
  }

  return new NextResponse("Socket.io Server is Active, Clean & Merged", { status: 200 });
}