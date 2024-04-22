"use client";

import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, Timestamp, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { db } from "../../../firebase";
import { BiSolidPaperPlane } from "react-icons/bi";
import { useAppContext } from '@/context/AppContext';
import OpenAI from 'openai';

type Message = {
  text: string;
  sender: string;
  createdAt: Timestamp;
}

const Chat = () => {

  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
    dangerouslyAllowBrowser: true,
  });
  console.log(openai);

  const { selectedRoom } = useAppContext();

  const [inputMessage, setInputMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  //各Roomのメッセージを取得
  useEffect(() => {
    if (selectedRoom) {
      const fetchMessages = async () => {
        const roomDocRef = doc(db, "rooms", selectedRoom);
        const messagesCollectionRef = collection(roomDocRef, "messages");

        const q = query(messagesCollectionRef, orderBy("createdAt"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const newMessages = snapshot.docs.map((doc) => doc.data() as Message);
          setMessages(newMessages);
        });

        return () => {
          unsubscribe();
        };
      };

      fetchMessages();
    }
  }, [selectedRoom]);


  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const messageData = {
      text: inputMessage,
      sender: "user",
      createdAt: serverTimestamp(),
    };

    //メッセージをFireStoreに保存
    const roomDocRef = doc(db, "rooms", selectedRoom!);
    const messageCollectionRef = collection(roomDocRef, "messages");
    await addDoc(messageCollectionRef, messageData);

    //OpenAIからの返信
    const gptResponse = await openai.chat.completions.create({
      messages: [{ role: "user", content: inputMessage }],
      model: "gpt-3.5-turbo",
    });
    const botResponse = gptResponse.choices[0].message.content;

    console.log(botResponse);

    await addDoc(messageCollectionRef, {
      text: botResponse,
      sender: "bot",
      createdAt: serverTimestamp(),
    });
  };

  return (
    <div className='h-full bg-gray-400 p-4 flex flex-col'>
      <h1 className='border-b text-2xl text-white mb-4 font-semibold'>Room1</h1>
      <div className='flex-grow over-flow-y-auto mb-4'>
        {messages.map((message, index) => (
            <div key={index} className={message.sender === "user" ? "text-right" : "text-left"}>
              <div
               className={message.sender === "user"
               ? 'bg-white inline-block rounded px-4 py-2 mb-4 shadow-[3px_3px_0px_0px_rgba(100,100,100)]'
               : 'bg-gray-700 inline-block rounded px-4 py-2 mb-4 shadow-[3px_3px_0px_0px_rgba(100,100,100)]'}
              >
                <p className={message.sender === "user"
                 ? 'font-medium'
                 : 'text-white font-medium'}
                >
                  {message.text}
                </p>
              </div>
            </div>
        ))}

        
      </div>

      <div className='flex-shrink-0 relative'>
        <input
         type="text"
         placeholder='Send a message'
         className='border-2 rounded w-full p-2 focus:outline-none'
         onChange={(e) => setInputMessage(e.target.value)}
        />
        <button
         className='absolute inset-y-0 right-4 flex items-center'
         onClick={() => sendMessage()}
        >
          <BiSolidPaperPlane />
        </button>
      </div>
    </div>
  )
};

export default Chat