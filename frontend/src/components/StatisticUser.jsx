import React, { useState, useEffect } from 'react';
import { StatCard } from './StatisticCards';
import { WeeklyChart } from './WeklyChart';
import { useParams } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import '../i18n';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../hooks/useAuthContext';
import { UseProfilContext } from '../hooks/useProfilContext';

export const Statistics = () => {

  const { stats, currentFriend, weeklyPerformance } = UseProfilContext()
  const { user: {username} } = useAuthContext()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>
      <WeeklyChart user={currentFriend || username} percentages={weeklyPerformance} loading={false} />
    </div>
  );
};