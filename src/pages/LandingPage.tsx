import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { doc, setDoc, query, collection, where, orderBy, getDocs, serverTimestamp, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Phone, CalendarCheck, Clock, MapPin, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ReservationForm {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  inquiry: string;
}

export default function LandingPage() {
  const { user, signIn } = useAuth();
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ReservationForm>();

  const onSubmit = async (data: ReservationForm) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    setSubmitting(true);
    try {
      // Add a new document with a generated id.
      const docRef = await addDoc(collection(db, "reservations"), {
        userId: user.uid,
        name: data.name,
        phone: data.phone,
        date: data.date,
        time: data.time,
        guests: data.guests || "",
        inquiry: data.inquiry || "",
        status: "대기", // Wait, enum expects "대기", "완료", "취소"
        createdAt: serverTimestamp()
      });
      setReservationSuccess(true);
      reset();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reservations');
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToReservation = () => {
    const el = document.getElementById('reservation-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="font-sans text-gray-900 bg-gray-50 pb-24 w-full overflow-x-hidden">
      
      {/* 1. HERO Section */}
      <section className="relative w-full bg-slate-900 text-white flex flex-col items-center justify-center pt-24 pb-20 px-4">
        <div className="absolute inset-0 overflow-hidden">
          {/* Abstract dark building background, or simple gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 opacity-90"></div>
          {/* Faint circles or patterns */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl w-full flex flex-col items-center text-center space-y-6">
          <div className="flex space-x-3 mb-2">
            <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold rounded-full animate-pulse">파격조건 변경</span>
            <span className="bg-amber-500 text-white px-3 py-1 text-sm font-bold rounded-full">선착순 혜택 마감임박</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
            대전 성남 우미린 <br />
            <span className="text-red-500">🔥 파격조건 변경!</span><br />
            <span className="block mt-2">지금이 마지막 기회</span>
          </h1>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-2xl mt-8">
            <ul className="space-y-4 text-left w-full mx-auto font-medium text-lg md:text-xl">
              <li className="flex items-center space-x-3">
                <CheckCircle2 className="text-green-400 w-6 h-6 flex-shrink-0" />
                <span><strong className="text-yellow-400">단 1,000만원</strong>으로 입주까지 가능</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle2 className="text-green-400 w-6 h-6 flex-shrink-0" />
                <span>계약축하금 <strong className="text-yellow-400">최대 1,911만원</strong> 지급</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle2 className="text-green-400 w-6 h-6 flex-shrink-0" />
                <span>중도금 <strong className="text-yellow-400">전액 무이자</strong> 지원</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row w-full max-w-md gap-4 mt-8">
            <a href="tel:1522-1560" className="flex-1 bg-slate-800 border-2 border-slate-600 hover:bg-slate-700 text-white py-4 px-6 rounded-xl font-bold flex items-center justify-center space-x-2 transition-transform active:scale-95">
              <Phone className="w-5 h-5" />
              <span>상담전화 1522-1560</span>
            </a>
            <button onClick={scrollToReservation} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-xl font-bold flex items-center justify-center space-x-2 transition-transform active:scale-95 shadow-lg shadow-red-600/30">
              <CalendarCheck className="w-5 h-5" />
              <span>방문 예약하기</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Urgency Section */}
      <section className="bg-red-50 py-12 px-4 border-y border-red-100 flex flex-col items-center text-center">
        <div className="flex items-center justify-center mb-4 text-red-600">
          <AlertCircle className="w-12 h-12 animate-bounce" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">지금 문의가 급증하고 있습니다.</h2>
        <p className="text-lg text-red-600 font-semibold mb-2">좋은 동·호수는 선착순으로 마감됩니다.</p>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">최근 조건 변경 이후 예약 폭주<br />오늘도 빠르게 마감 중입니다.</p>
        <button onClick={scrollToReservation} className="bg-gray-900 hover:bg-black text-white py-3 px-8 rounded-full font-bold transition-transform active:scale-95">
          지금 바로 방문예약
        </button>
      </section>

      {/* 3. Core Benefits Section */}
      <section className="py-20 px-4 w-full max-w-6xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-12">
          지금 계약해야 하는 이유 <span className="text-red-600">4가지</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-xl font-black mb-6">1</div>
            <h3 className="text-2xl font-bold mb-4">파격 조건 변경</h3>
            <p className="text-gray-600 text-lg mb-2">분양 조건 <strong className="text-gray-900">대폭 완화</strong></p>
            <p className="text-gray-600 text-lg">초기 부담 <strong className="text-gray-900">최소화</strong></p>
          </div>
          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-red-100 flex flex-col hover:shadow-md transition-shadow transform md:-translate-y-4">
            <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center text-xl font-black mb-6 shadow-lg shadow-red-200">2</div>
            <h3 className="text-2xl font-bold mb-4">1천만원 입주 가능</h3>
            <p className="text-gray-600 text-lg mb-2">단 <strong className="text-red-600 text-xl">1,000만원</strong>으로 계약부터 입주까지</p>
            <p className="text-gray-600 text-lg">초기 자금 부담 완벽 해소</p>
          </div>
          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-red-100 flex flex-col hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center text-xl font-black mb-6 shadow-lg shadow-red-200">3</div>
            <h3 className="text-2xl font-bold mb-4">계약 축하금</h3>
            <p className="text-gray-600 text-lg mb-2">최대 <strong className="text-red-600 text-2xl font-black tracking-tight">1,911만원</strong> 지급</p>
            <p className="text-gray-600 text-lg">실질 분양가 절감 효과</p>
          </div>
          {/* Card 4 */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow transform md:translate-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-xl font-black mb-6">4</div>
            <h3 className="text-2xl font-bold mb-4">중도금 무이자</h3>
            <p className="text-gray-600 text-lg mb-2">중도금 <strong className="text-gray-900">전액 무이자</strong> 지원</p>
            <p className="text-gray-600 text-lg text-red-600 font-bold">이자 부담 ZERO</p>
          </div>
        </div>

        <button onClick={scrollToReservation} className="mt-16 bg-red-600 hover:bg-red-700 text-white py-4 px-12 rounded-full text-lg font-bold flex items-center justify-center space-x-2 transition-transform active:scale-95 shadow-xl shadow-red-600/20">
          <CalendarCheck className="w-5 h-5" />
          <span>가장 좋은 동·호수 예약하기</span>
        </button>
      </section>

      {/* 4. Visit Inducement Section */}
      <section className="bg-slate-900 text-white py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
            방문 상담 시 <br className="md:hidden" />
            <span className="text-amber-400">가장 좋은 혜택과 동·호수 안내</span>
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            전화 상담만으로는 정확한 안내가 어렵습니다.<br />
            방문 고객에게 우선 혜택이 제공됩니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-12">
            <div className="bg-slate-800 p-6 rounded-2xl">
              <CheckCircle2 className="text-green-400 w-8 h-8 mb-4" />
              <h4 className="font-bold text-xl mb-2">사전예약 우선 상담</h4>
              <p className="text-gray-400">대기 없이 전문 상담사와 1:1 디테일 상담 제공</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl">
              <CheckCircle2 className="text-green-400 w-8 h-8 mb-4" />
              <h4 className="font-bold text-xl mb-2">잔여세대 실시간 안내</h4>
              <p className="text-gray-400">공개되지 않은 로얄동·호수 최우선 안내 혜택</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl">
              <CheckCircle2 className="text-green-400 w-8 h-8 mb-4" />
              <h4 className="font-bold text-xl mb-2">맞춤 금융 상담</h4>
              <p className="text-gray-400">개인별 대출 한도 및 최적의 금융 조건 설계 검토</p>
            </div>
          </div>
          <button onClick={scrollToReservation} className="bg-white text-slate-900 hover:bg-gray-100 py-4 px-12 rounded-full text-lg font-bold transition-transform active:scale-95 shrink-0 inline-flex items-center space-x-2">
            <span>📅</span>
            <span>방문 예약하기</span>
          </button>
        </div>
      </section>

      {/* 5. Reservation System */}
      <section id="reservation-section" className="py-20 px-4 w-full">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 overflow-hidden">
          <div className="bg-gray-900 text-white p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">모델하우스 방문예약</h2>
            <p className="text-gray-300">원하시는 날짜와 시간을 선택해 주세요.</p>
          </div>
          
          <div className="p-8">
            {!user ? (
              <div className="text-center py-12">
                <CalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">간편 로그인 후 예약이 가능합니다.</h3>
                <p className="text-gray-500 mb-8">빠르고 안전하게 정보를 확인하세요.</p>
                <button onClick={signIn} className="bg-[#4285F4] hover:bg-[#3367D6] text-white py-3 px-8 rounded-xl font-bold flex items-center justify-center space-x-3 w-full md:w-auto mx-auto transition-transform active:scale-95 shadow-md">
                  <div className="bg-white p-1 rounded-sm">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <span>Google 간편 로그인</span>
                </button>
              </div>
            ) : reservationSuccess ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h3 className="text-3xl font-bold mb-4 text-gray-900">예약이 완료되었습니다!</h3>
                <p className="text-lg text-gray-600 mb-8">상담원이 확인 후 신속하게 연락드리겠습니다.</p>
                <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">안내사항</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>방문 시 신분증을 꼭 지참해 주세요.</li>
                    <li>예약 시간 10분 전 도착을 권장합니다.</li>
                    <li>주차 공간이 협소할 수 있으니 대중교통 이용을 고려해주세요.</li>
                  </ul>
                </div>
                <button onClick={() => setReservationSuccess(false)} className="text-red-600 font-bold hover:underline">
                  다른 날짜 추가 예약하기
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">이름 *</label>
                  <input 
                    {...register('name', { required: true })} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow"
                    placeholder="홍길동"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">이름을 입력해주세요.</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">연락처 *</label>
                  <input 
                    {...register('phone', { required: true })} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow"
                    placeholder="010-0000-0000"
                    type="tel"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">연락처를 입력해주세요.</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">방문 날짜 *</label>
                    <input 
                      {...register('date', { required: true })} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow"
                      type="date"
                    />
                    {errors.date && <p className="text-red-500 text-sm mt-1">날짜를 선택해주세요.</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">방문 시간 *</label>
                    <select 
                      {...register('time', { required: true })} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow bg-white"
                    >
                      <option value="">선택해주세요</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="13:00">13:00 PM</option>
                      <option value="14:00">14:00 PM</option>
                      <option value="15:00">15:00 PM</option>
                      <option value="16:00">16:00 PM</option>
                      <option value="17:00">17:00 PM</option>
                    </select>
                    {errors.time && <p className="text-red-500 text-sm mt-1">시간을 선택해주세요.</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">상담 인원 (선택)</label>
                  <select 
                    {...register('guests')} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow bg-white"
                  >
                    <option value="1명">1명</option>
                    <option value="2명">2명</option>
                    <option value="3명">3명</option>
                    <option value="4명 이상">4명 이상</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">문의 내용 (선택)</label>
                  <textarea 
                    {...register('inquiry')} 
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow"
                    placeholder="궁금하신 점이나 특별히 원하시는 동/호수 조건이 있다면 남겨주세요."
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-4 text-center">예약 신청 시, 개인정보 수집 및 이용에 동의하는 것으로 간주합니다.</p>
                  <button 
                    disabled={submitting}
                    className="w-full bg-red-600 disabled:bg-gray-400 hover:bg-red-700 text-white py-4 px-6 rounded-xl text-lg font-bold transition-transform active:scale-95 shadow-lg shadow-red-600/30"
                  >
                    {submitting ? '신청 처리 중...' : '방문 예약 완료하기'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 6. Phone Inducement Section */}
      <section className="bg-white py-16 px-4 text-center border-t border-gray-100">
        <h2 className="text-3xl font-black mb-4">지금 바로 상담 가능</h2>
        <p className="text-gray-600 text-lg mb-8">
          빠른 상담은 전화가 가장 정확합니다.<br />
          아래 번호를 누르면 즉시 연결됩니다.
        </p>
        <a href="tel:1522-1560" className="inline-flex w-full max-w-sm mx-auto flex-col items-center justify-center p-6 bg-gray-900 border border-black hover:bg-black text-white rounded-3xl transition-transform active:scale-95 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
           <Phone className="w-10 h-10 mb-3 text-red-500 animate-pulse" />
           <span className="text-3xl font-black tracking-wider mb-1">1522-1560</span>
           <span className="text-sm text-gray-400 font-medium">터치하여 바로 전화 연결</span>
        </a>
      </section>

      {/* 7. Final Deadline Pressure Section */}
      <section className="bg-red-600 text-white py-12 px-4 text-center">
        <h3 className="text-2xl font-bold mb-2">파격 조건은 조기 종료될 수 있습니다.</h3>
        <p className="text-lg font-medium opacity-90 mb-8">지금 예약하고 모든 혜택을 선점하세요!</p>
        
        <div className="flex flex-col sm:flex-row justify-center max-w-lg mx-auto gap-4">
          <button onClick={scrollToReservation} className="flex-1 bg-white text-red-600 hover:bg-gray-100 py-3 px-6 rounded-xl font-bold transition-transform active:scale-95 text-lg">
            방문 예약하기
          </button>
          <a href="tel:1522-1560" className="flex-1 bg-transparent border-2 border-white hover:bg-white/10 text-white py-3 px-6 rounded-xl font-bold transition-transform active:scale-95 text-lg">
            전화 상담하기
          </a>
        </div>
      </section>

      {/* Footer / Mobile floating CTA */}
      <footer className="text-center py-8 text-gray-400 text-sm mb-20">
        <p>© 2026 대전 성남 우미린. All rights reserved.</p>
        <p>본 사이트의 이미지는 소비자의 이해를 돕기 위한 컷으로 실제와 상이할 수 있습니다.</p>
        <Link to="/admin" className="text-gray-400 hover:text-gray-600 underline mt-4 inline-block">관리자 모드</Link>
      </footer>

      {/* Mobile Floating Button */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden flex gap-2">
         <a href="tel:1522-1560" className="flex-1 bg-gray-900 border border-gray-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-2xl">
           <Phone className="w-5 h-5" />
           <span className="text-[15px]">전화상담</span>
         </a>
         <button onClick={scrollToReservation} className="flex-1 bg-red-600 border border-red-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-2xl">
           <CalendarCheck className="w-5 h-5" />
           <span className="text-[15px]">우선예약</span>
         </button>
      </div>

    </div>
  );
}
