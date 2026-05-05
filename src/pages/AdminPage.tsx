import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ChevronLeft, Download, RefreshCcw } from 'lucide-react';

interface Reservation {
  id: string;
  userId: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  inquiry: string;
  status: string;
  createdAt: any;
}

export default function AdminPage() {
  const { user, logOut } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
    
    // Using onSnapshot for real-time updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Reservation[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Reservation);
      });
      setReservations(data);
      setLoading(false);
      setErrorStatus(null);
    }, (error) => {
      setLoading(false);
      setErrorStatus("데이터를 불러오지 못했습니다. 우측 상단의 '관리자권한 부여' 버튼을 먼저 눌러주세요.");
      try {
        handleFirestoreError(error, OperationType.LIST, 'reservations');
      } catch (e) {
        // ignore thrown error
      }
    });

    return () => unsubscribe();
  }, [user]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'reservations', id), { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reservations/${id}`);
    }
  };

  const handleMakeAdmin = async () => {
    try {
       await updateDoc(doc(db, 'users', user!.uid), { isAdmin: true });
       alert("관리자 권한이 부여되었습니다. 새로고침 해주세요.");
       window.location.reload();
    } catch (err) {
       console.error(err);
       alert("권한 부여 실패");
    }
  }

  const exportToCSV = () => {
    const headers = ['이름', '연락처', '날짜', '시간', '인원', '문의내용', '상태', '완료/대기'];
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(',') + '\n'
      + reservations.map(r => 
          `"${r.name}","${r.phone}","${r.date}","${r.time}","${r.guests}","${r.inquiry.replace(/\n/g, ' ')}","${r.status}"`
        ).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `방문예약리스트_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredReservations = filterDate 
    ? reservations.filter(r => r.date === filterDate)
    : reservations;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 border border-gray-300 rounded-lg hover:bg-white bg-gray-50 transition">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">예약 관리 대시보드</h1>
              <p className="text-gray-500">실시간 방문 예약 리스트</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            {user?.email === "choihj2162@gmail.com" && (
                <button onClick={handleMakeAdmin} className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium">관리자권한 부여(초기화용)</button>
            )}
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-900 flex-1 md:flex-none"
            />
            <button 
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">엑셀 다운로드</span>
            </button>
            <button onClick={logOut} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium shrink-0">
               로그아웃
            </button>
          </div>
        </div>

        <div className="bg-white border text-left border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">예약자</th>
                  <th className="px-6 py-4">연락처</th>
                  <th className="px-6 py-4">방문일시</th>
                  <th className="px-6 py-4">인원</th>
                  <th className="px-6 py-4 hidden md:table-cell">문의내용</th>
                  <th className="px-6 py-4">상태</th>
                  <th className="px-6 py-4">상태변경</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <RefreshCcw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      데이터를 불러오는 중입니다...
                    </td>
                  </tr>
                ) : errorStatus ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-red-500 font-medium">
                      {errorStatus}
                    </td>
                  </tr>
                ) : filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      예약 내역이 없습니다.
                    </td>
                  </tr>
                ) : filteredReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{res.name}</td>
                    <td className="px-6 py-4 text-gray-600">{res.phone}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{res.date}</div>
                      <div className="text-gray-500">{res.time}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{res.guests || '-'}</td>
                    <td className="px-6 py-4 hidden md:table-cell text-gray-500 max-w-xs truncate">
                      {res.inquiry || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${res.status === '대기' ? 'bg-yellow-100 text-yellow-800' : 
                          res.status === '완료' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={res.status}
                        onChange={(e) => updateStatus(res.id, e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="대기">대기</option>
                        <option value="완료">완료</option>
                        <option value="취소">취소</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
