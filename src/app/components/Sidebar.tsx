"use client";

import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, Timestamp, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { FaSignOutAlt } from 'react-icons/fa';
import { auth, db } from '../../../firebase';
import { unsubscribe } from 'diagnostics_channel';
import { useAppContext } from '@/context/AppContext';
import { DiVim } from 'react-icons/di';

type Room = {
  id: string;
  name: string;
  createdAt: Timestamp;
}

const Sidebar = () => {
  const { user, userId, setSelectedRoom } = useAppContext();

  const [rooms, setRooms] = useState<Room[]>([]);

  const selectRoom = (roomId:string) => {
    setSelectedRoom(roomId);
  };

  useEffect(() => {
    if (user) {
      const fetchRooms = async () =>{
        const roomCollectionRef = collection(db, "rooms");
        const q = query(roomCollectionRef, where("userid", "==", userId), orderBy("createdAt"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const newRooms: Room[] = snapshot.docs.map((doc) => ({
            id: doc.id,       //ドキュメントID
            name: doc.data().name,
            createdAt: doc.data().createdAt,    //ドキュメント配下の全データ取得
          }));
          setRooms(newRooms);
        });

        return () => {
          unsubscribe();
        };
      };

    fetchRooms();
    }
  }, [userId]);

  const addNewRoom = async () => {
    const roomName = prompt("ルーム名を入力");
    if(roomName) {
      const newRoomRef = collection(db, "rooms");
      await addDoc(newRoomRef, {
        name: roomName,
        userid: userId,
        createdAt: serverTimestamp(),
      });
    }
  }

  const handleLogout = () => {
    auth.signOut();
  }

  return (
    <div className='h-full bg-gray-50 overflow-y-auto px-5 flex flex-col'>
        <div className='flex-grow relative'>
          <div onClick={addNewRoom} className='cursor-pointer flex justify-evenly items-center mt-2 mb-8 rounded-md border shadow-[0px_10px_1px_rgba(221,_221,_221,_1),_0_10px_20px_rgba(204,_204,_204,_1)]'>
            <span className='p-4 text-2xl'>＋</span>
            <h1 className='text-xl  font-semibold p-4'>New Chat</h1>
          </div>
          <ul>
            {rooms.map((room) => (
            <li
             key={room.id}
             className='btn-chatlist'
             onClick={() => selectRoom(room.id)}
            >{room.name}</li>
            ))}
          {/* <li className='btn-chatlist'>Room 1</li>
          <li className='btn-chatlist'>Room 2</li>
          <li className='btn-chatlist'>Room 3</li> */}
        </ul>
        </div>

        {user && <div className='mb-2 p-4 text-lg font-medium'>{user.email}</div>}

        <div
         onClick={handleLogout}
         className='text-lg flex items-center justify-evenly mb-2 cursor-pointer p-4 border drop-shadow-lg hover:bg-gray-300 duration-100'>
          <FaSignOutAlt />
          <span>ログアウト</span>
        </div>
    </div>
  )
};

export default Sidebar