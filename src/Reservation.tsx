import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Icon,
  InputLabel,
  Link,
  List,
  ListItem,
  ListItemText,
  Select,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import { useNavigate } from 'react-router-dom';
import MomentUtils from '@date-io/moment';
import { isMobile } from 'react-device-detect';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { DatePicker, MuiPickersUtilsProvider, TimePicker } from '@material-ui/pickers';
import { Amenity, ReservationTime, Question, UserManager } from 'condo-brain';
import Schedule from '@material-ui/icons/Schedule';
import EventAvailable from '@material-ui/icons/EventAvailable';
import moment from 'moment';
import './styles/application.scss';
import './styles/parking.scss';

const minutesToReadable = (t: number): string => {
  const hours = Math.floor(t / 60);
  const hourText = hours > 1 ? 'hours' : 'hour';

  const minutes = t % 60;

  let timeText = '';
  if (hours > 0) {
    timeText = `${hours} ${hourText} `;
  }

  if (minutes > 0) {
    timeText = `${timeText} ${minutes} minutes`;
  }
  return timeText;
};

const addMinutes = (date: Date, min: number): Date => {
  const updatedDate = new Date(date);
  updatedDate.setMinutes(date.getMinutes() + min);
  return updatedDate;
};

const roundToMinuteInterval = (date: Date, interval: number): Date => {
  const time = (date.getHours() * 60) + date.getMinutes();
  const rounded = Math.round(time / interval) * interval;
  const roundedDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    Math.floor(rounded / 60),
    rounded % 60,
  );
  return roundedDate;
};

const formatDate = (date: Date): string => {
  let month = date.toLocaleDateString().split('/')[0];
  let day = date.toLocaleDateString().split('/')[1];
  const year = date.toLocaleDateString().split('/')[2];

  if (parseInt(month, 10) < 10) {
    month = `0${month}`;
  }
  if (parseInt(day, 10) < 10) {
    day = `0${day}`;
  }

  return `${year}-${month}-${day}`;
};

const formatTime = (date: Date): string => {
  const options = { hour12: false, hour: '2-digit', minute: '2-digit' };
  return date.toLocaleTimeString([], options);
};

export default function Resevation(): JSX.Element {
  const [selectedStartDate, setSelectedStartDateChange] = useState<Date>(roundToMinuteInterval(new Date(), 15));
  const [selectedEndDate, setSelectedEndDateChange] = useState<Date>(addMinutes(selectedStartDate, 30));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [amenity, setAmenity] = useState<string | unknown>(null);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [questions, setQuestions] = useState<{ [id: number]: Question[] } >([]);
  const [thanks, setThanks] = useState(false);
  const [amenityTime, setAmenityTime] = useState<number>(60);
  const [errorMessage, setErrorMessage] = useState<string | unknown>(null);
  const [availability, setAvailability] = useState<JSX.Element | null>(null);
  const [selectedAmenityName, setSelectedAmenityName] = useState<string | unknown>('');

  const userManager = new UserManager();
  const navigate = useNavigate();

  const reserve = (e: React.FormEvent): void => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('reservation[resource_id]', String(amenity));
    formData.append('reservation[start_time]', String(selectedStartDate));
    formData.append('reservation[end_time]', String(selectedEndDate));
    formData.append('answers[]', JSON.stringify(answers));
    userManager.createReservation(formData)
      .then((response) => {
        if (response.success === true) {
          setThanks(true);
          setSelectedStartDateChange(new Date());
          setSelectedEndDateChange(new Date());
          setAmenity(null);
          setAnswers([]);
          setErrorMessage(null);
        } else if (response.error === 'Unprocessable Entity') {
          const err = 'Please make sure you have filled out the form correctly. '
            + 'If you could not check every box, then you cannot use this amenity.';
          setErrorMessage(err);
        } else {
          setErrorMessage(response.error);
        }
      });
  };

  const fetchAmenities = async (): Promise<void> => (new Promise<void> (() => {
    const result = JSON.parse('[{"id":18,"name":"Board room","timeLimit":60,"questions":[{"id":17,"question":"1. I have not tested positive for COVID-19, I am not exhibiting any cold, flu or COVID-19 symptoms, and I do not have a fever.","required_answer":true,"created_at":"2020-08-26T20:24:55.766Z","updated_at":"2020-08-26T20:24:55.766Z"},{"id":11,"question":"2. I have not been outside Canada in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:29.257Z","updated_at":"2020-08-26T20:14:29.257Z"},{"id":12,"question":"3. I have not been in contact with anyone COVID-19 positive in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:57.180Z","updated_at":"2020-08-26T20:14:57.180Z"},{"id":14,"question":"4. I agree to disinfect all surfaces prior to and subsequent to my use of this amenity.","required_answer":true,"created_at":"2020-08-26T20:15:54.862Z","updated_at":"2020-08-26T20:15:54.862Z"},{"id":15,"question":"5. I agree not to bring any non-residents to this amenity.","required_answer":true,"created_at":"2020-08-26T20:21:04.059Z","updated_at":"2020-08-26T20:21:04.059Z"},{"id":16,"question":"6. I agree to not move any furniture between zones.","required_answer":true,"created_at":"2020-08-26T20:21:32.561Z","updated_at":"2020-08-26T20:21:32.561Z"},{"id":18,"question":"7. I agree to wear a mask or other face covering while using this amenity.","required_answer":true,"created_at":"2020-08-26T20:25:51.823Z","updated_at":"2020-08-26T20:25:51.823Z"}]},{"id":10,"name":"Fitness room (elliptical zone)","timeLimit":60,"questions":[{"id":17,"question":"1. I have not tested positive for COVID-19, I am not exhibiting any cold, flu or COVID-19 symptoms, and I do not have a fever.","required_answer":true,"created_at":"2020-08-26T20:24:55.766Z","updated_at":"2020-08-26T20:24:55.766Z"},{"id":11,"question":"2. I have not been outside Canada in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:29.257Z","updated_at":"2020-08-26T20:14:29.257Z"},{"id":12,"question":"3. I have not been in contact with anyone COVID-19 positive in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:57.180Z","updated_at":"2020-08-26T20:14:57.180Z"},{"id":14,"question":"4. I agree to disinfect all surfaces prior to and subsequent to my use of this amenity.","required_answer":true,"created_at":"2020-08-26T20:15:54.862Z","updated_at":"2020-08-26T20:15:54.862Z"},{"id":15,"question":"5. I agree not to bring any non-residents to this amenity.","required_answer":true,"created_at":"2020-08-26T20:21:04.059Z","updated_at":"2020-08-26T20:21:04.059Z"}]},{"id":9,"name":"Fitness room (treadmill zone)","timeLimit":60,"questions":[{"id":17,"question":"1. I have not tested positive for COVID-19, I am not exhibiting any cold, flu or COVID-19 symptoms, and I do not have a fever.","required_answer":true,"created_at":"2020-08-26T20:24:55.766Z","updated_at":"2020-08-26T20:24:55.766Z"},{"id":11,"question":"2. I have not been outside Canada in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:29.257Z","updated_at":"2020-08-26T20:14:29.257Z"},{"id":12,"question":"3. I have not been in contact with anyone COVID-19 positive in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:57.180Z","updated_at":"2020-08-26T20:14:57.180Z"},{"id":14,"question":"4. I agree to disinfect all surfaces prior to and subsequent to my use of this amenity.","required_answer":true,"created_at":"2020-08-26T20:15:54.862Z","updated_at":"2020-08-26T20:15:54.862Z"},{"id":15,"question":"5. I agree not to bring any non-residents to this amenity.","required_answer":true,"created_at":"2020-08-26T20:21:04.059Z","updated_at":"2020-08-26T20:21:04.059Z"}]},{"id":11,"name":"Fitness room (weights zone)","timeLimit":60,"questions":[{"id":17,"question":"1. I have not tested positive for COVID-19, I am not exhibiting any cold, flu or COVID-19 symptoms, and I do not have a fever.","required_answer":true,"created_at":"2020-08-26T20:24:55.766Z","updated_at":"2020-08-26T20:24:55.766Z"},{"id":11,"question":"2. I have not been outside Canada in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:29.257Z","updated_at":"2020-08-26T20:14:29.257Z"},{"id":12,"question":"3. I have not been in contact with anyone COVID-19 positive in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:57.180Z","updated_at":"2020-08-26T20:14:57.180Z"},{"id":14,"question":"4. I agree to disinfect all surfaces prior to and subsequent to my use of this amenity.","required_answer":true,"created_at":"2020-08-26T20:15:54.862Z","updated_at":"2020-08-26T20:15:54.862Z"},{"id":15,"question":"5. I agree not to bring any non-residents to this amenity.","required_answer":true,"created_at":"2020-08-26T20:21:04.059Z","updated_at":"2020-08-26T20:21:04.059Z"}]},{"id":19,"name":"Meeting room","timeLimit":60,"questions":[{"id":17,"question":"1. I have not tested positive for COVID-19, I am not exhibiting any cold, flu or COVID-19 symptoms, and I do not have a fever.","required_answer":true,"created_at":"2020-08-26T20:24:55.766Z","updated_at":"2020-08-26T20:24:55.766Z"},{"id":11,"question":"2. I have not been outside Canada in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:29.257Z","updated_at":"2020-08-26T20:14:29.257Z"},{"id":12,"question":"3. I have not been in contact with anyone COVID-19 positive in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:57.180Z","updated_at":"2020-08-26T20:14:57.180Z"},{"id":14,"question":"4. I agree to disinfect all surfaces prior to and subsequent to my use of this amenity.","required_answer":true,"created_at":"2020-08-26T20:15:54.862Z","updated_at":"2020-08-26T20:15:54.862Z"},{"id":15,"question":"5. I agree not to bring any non-residents to this amenity.","required_answer":true,"created_at":"2020-08-26T20:21:04.059Z","updated_at":"2020-08-26T20:21:04.059Z"},{"id":16,"question":"6. I agree to not move any furniture between zones.","required_answer":true,"created_at":"2020-08-26T20:21:32.561Z","updated_at":"2020-08-26T20:21:32.561Z"},{"id":18,"question":"7. I agree to wear a mask or other face covering while using this amenity.","required_answer":true,"created_at":"2020-08-26T20:25:51.823Z","updated_at":"2020-08-26T20:25:51.823Z"}]},{"id":27,"name":"Rooftop BBQ (zone A, left side)","timeLimit":60,"questions":[{"id":17,"question":"1. I have not tested positive for COVID-19, I am not exhibiting any cold, flu or COVID-19 symptoms, and I do not have a fever.","required_answer":true,"created_at":"2020-08-26T20:24:55.766Z","updated_at":"2020-08-26T20:24:55.766Z"},{"id":11,"question":"2. I have not been outside Canada in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:29.257Z","updated_at":"2020-08-26T20:14:29.257Z"},{"id":12,"question":"3. I have not been in contact with anyone COVID-19 positive in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:57.180Z","updated_at":"2020-08-26T20:14:57.180Z"},{"id":14,"question":"4. I agree to disinfect all surfaces prior to and subsequent to my use of this amenity.","required_answer":true,"created_at":"2020-08-26T20:15:54.862Z","updated_at":"2020-08-26T20:15:54.862Z"},{"id":15,"question":"5. I agree not to bring any non-residents to this amenity.","required_answer":true,"created_at":"2020-08-26T20:21:04.059Z","updated_at":"2020-08-26T20:21:04.059Z"}]},{"id":28,"name":"Rooftop BBQ (zone B, right side)","timeLimit":60,"questions":[{"id":17,"question":"1. I have not tested positive for COVID-19, I am not exhibiting any cold, flu or COVID-19 symptoms, and I do not have a fever.","required_answer":true,"created_at":"2020-08-26T20:24:55.766Z","updated_at":"2020-08-26T20:24:55.766Z"},{"id":11,"question":"2. I have not been outside Canada in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:29.257Z","updated_at":"2020-08-26T20:14:29.257Z"},{"id":12,"question":"3. I have not been in contact with anyone COVID-19 positive in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:57.180Z","updated_at":"2020-08-26T20:14:57.180Z"},{"id":14,"question":"4. I agree to disinfect all surfaces prior to and subsequent to my use of this amenity.","required_answer":true,"created_at":"2020-08-26T20:15:54.862Z","updated_at":"2020-08-26T20:15:54.862Z"},{"id":15,"question":"5. I agree not to bring any non-residents to this amenity.","required_answer":true,"created_at":"2020-08-26T20:21:04.059Z","updated_at":"2020-08-26T20:21:04.059Z"}]},{"id":34,"name":"Rooftop patio table L1 (4 people)","timeLimit":120,"questions":[{"id":17,"question":"1. I have not tested positive for COVID-19, I am not exhibiting any cold, flu or COVID-19 symptoms, and I do not have a fever.","required_answer":true,"created_at":"2020-08-26T20:24:55.766Z","updated_at":"2020-08-26T20:24:55.766Z"},{"id":11,"question":"2. I have not been outside Canada in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:29.257Z","updated_at":"2020-08-26T20:14:29.257Z"},{"id":12,"question":"3. I have not been in contact with anyone COVID-19 positive in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:57.180Z","updated_at":"2020-08-26T20:14:57.180Z"},{"id":14,"question":"4. I agree to disinfect all surfaces prior to and subsequent to my use of this amenity.","required_answer":true,"created_at":"2020-08-26T20:15:54.862Z","updated_at":"2020-08-26T20:15:54.862Z"},{"id":16,"question":"6. I agree to not move any furniture between zones.","required_answer":true,"created_at":"2020-08-26T20:21:32.561Z","updated_at":"2020-08-26T20:21:32.561Z"}]},{"id":33,"name":"Rooftop patio table L2 (4 people)","timeLimit":120,"questions":[{"id":17,"question":"1. I have not tested positive for COVID-19, I am not exhibiting any cold, flu or COVID-19 symptoms, and I do not have a fever.","required_answer":true,"created_at":"2020-08-26T20:24:55.766Z","updated_at":"2020-08-26T20:24:55.766Z"},{"id":11,"question":"2. I have not been outside Canada in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:29.257Z","updated_at":"2020-08-26T20:14:29.257Z"},{"id":12,"question":"3. I have not been in contact with anyone COVID-19 positive in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:57.180Z","updated_at":"2020-08-26T20:14:57.180Z"},{"id":14,"question":"4. I agree to disinfect all surfaces prior to and subsequent to my use of this amenity.","required_answer":true,"created_at":"2020-08-26T20:15:54.862Z","updated_at":"2020-08-26T20:15:54.862Z"},{"id":16,"question":"6. I agree to not move any furniture between zones.","required_answer":true,"created_at":"2020-08-26T20:21:32.561Z","updated_at":"2020-08-26T20:21:32.561Z"}]},{"id":35,"name":"Rooftop patio table M1 (4 people)","timeLimit":120,"questions":[{"id":17,"question":"1. I have not tested positive for COVID-19, I am not exhibiting any cold, flu or COVID-19 symptoms, and I do not have a fever.","required_answer":true,"created_at":"2020-08-26T20:24:55.766Z","updated_at":"2020-08-26T20:24:55.766Z"},{"id":11,"question":"2. I have not been outside Canada in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:29.257Z","updated_at":"2020-08-26T20:14:29.257Z"},{"id":12,"question":"3. I have not been in contact with anyone COVID-19 positive in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:57.180Z","updated_at":"2020-08-26T20:14:57.180Z"},{"id":14,"question":"4. I agree to disinfect all surfaces prior to and subsequent to my use of this amenity.","required_answer":true,"created_at":"2020-08-26T20:15:54.862Z","updated_at":"2020-08-26T20:15:54.862Z"},{"id":16,"question":"6. I agree to not move any furniture between zones.","required_answer":true,"created_at":"2020-08-26T20:21:32.561Z","updated_at":"2020-08-26T20:21:32.561Z"}]},{"id":29,"name":"Rooftop patio table S1 (2 people)","timeLimit":120,"questions":[{"id":17,"question":"1. I have not tested positive for COVID-19, I am not exhibiting any cold, flu or COVID-19 symptoms, and I do not have a fever.","required_answer":true,"created_at":"2020-08-26T20:24:55.766Z","updated_at":"2020-08-26T20:24:55.766Z"},{"id":11,"question":"2. I have not been outside Canada in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:29.257Z","updated_at":"2020-08-26T20:14:29.257Z"},{"id":12,"question":"3. I have not been in contact with anyone COVID-19 positive in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:57.180Z","updated_at":"2020-08-26T20:14:57.180Z"},{"id":14,"question":"4. I agree to disinfect all surfaces prior to and subsequent to my use of this amenity.","required_answer":true,"created_at":"2020-08-26T20:15:54.862Z","updated_at":"2020-08-26T20:15:54.862Z"},{"id":16,"question":"6. I agree to not move any furniture between zones.","required_answer":true,"created_at":"2020-08-26T20:21:32.561Z","updated_at":"2020-08-26T20:21:32.561Z"}]},{"id":30,"name":"Rooftop patio table S2 (3 people)","timeLimit":120,"questions":[{"id":17,"question":"1. I have not tested positive for COVID-19, I am not exhibiting any cold, flu or COVID-19 symptoms, and I do not have a fever.","required_answer":true,"created_at":"2020-08-26T20:24:55.766Z","updated_at":"2020-08-26T20:24:55.766Z"},{"id":11,"question":"2. I have not been outside Canada in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:29.257Z","updated_at":"2020-08-26T20:14:29.257Z"},{"id":12,"question":"3. I have not been in contact with anyone COVID-19 positive in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:57.180Z","updated_at":"2020-08-26T20:14:57.180Z"},{"id":14,"question":"4. I agree to disinfect all surfaces prior to and subsequent to my use of this amenity.","required_answer":true,"created_at":"2020-08-26T20:15:54.862Z","updated_at":"2020-08-26T20:15:54.862Z"},{"id":16,"question":"6. I agree to not move any furniture between zones.","required_answer":true,"created_at":"2020-08-26T20:21:32.561Z","updated_at":"2020-08-26T20:21:32.561Z"}]},{"id":31,"name":"Rooftop patio table S3 (3 people)","timeLimit":120,"questions":[{"id":17,"question":"1. I have not tested positive for COVID-19, I am not exhibiting any cold, flu or COVID-19 symptoms, and I do not have a fever.","required_answer":true,"created_at":"2020-08-26T20:24:55.766Z","updated_at":"2020-08-26T20:24:55.766Z"},{"id":11,"question":"2. I have not been outside Canada in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:29.257Z","updated_at":"2020-08-26T20:14:29.257Z"},{"id":12,"question":"3. I have not been in contact with anyone COVID-19 positive in the last 14 days.","required_answer":true,"created_at":"2020-08-26T20:14:57.180Z","updated_at":"2020-08-26T20:14:57.180Z"},{"id":14,"question":"4. I agree to disinfect all surfaces prior to and subsequent to my use of this amenity.","required_answer":true,"created_at":"2020-08-26T20:15:54.862Z","updated_at":"2020-08-26T20:15:54.862Z"},{"id":16,"question":"6. I agree to not move any furniture between zones.","required_answer":true,"created_at":"2020-08-26T20:21:32.561Z","updated_at":"2020-08-26T20:21:32.561Z"}]}]');
    setAmenities(result);
    const amenityQuestions: { [id: number]: Question[] } = [];
    Object.keys(result).forEach((i) => {
      const a = result[Number(i)];
      amenityQuestions[a.id] = a.questions;
    });
    setQuestions(amenityQuestions);
  }));

  const findReservations = (): void => {
    if (true) {
      const result = JSON.parse('[{"id":240,"startTime":"2020-09-14T17:00:00.000Z","endTime":"2020-09-14T17:30:00.000Z"},{"id":628,"startTime":"2020-09-14T10:45:00.000Z","endTime":"2020-09-14T11:30:00.000Z"},{"id":629,"startTime":"2020-09-13T20:00:00.000Z","endTime":"2020-09-13T21:00:00.000Z"},{"id":631,"startTime":"2020-09-13T18:00:00.000Z","endTime":"2020-09-13T19:00:00.000Z"},{"id":239,"startTime":"2020-09-13T17:00:00.000Z","endTime":"2020-09-13T17:30:00.000Z"},{"id":603,"startTime":"2020-09-13T14:30:00.000Z","endTime":"2020-09-13T15:30:00.000Z"}]');
      if (result.length === 0) {
        setAvailability(
          <>
            <AlertTitle>
              {selectedAmenityName}
              {'  '}
              Availability
            </AlertTitle>
            No current bookings.
            <p>
              {minutesToReadable(amenityTime)}
              {'  '}
              limit.
            </p>
          </>,
        );
      } else {
        const times: string[] = [];
        Object.keys(result).forEach((a) => {
          const pos = Number(a);
          times.push(`${moment(result[pos].startTime).format('LT')} - ${moment(result[pos].endTime).format('LT')}`);
        });
        setAvailability(
          <>
            <AlertTitle>
              {selectedAmenityName}
              {' '}
              has a
              {' '}
              <strong>
                {minutesToReadable(amenityTime)}
                {' '}
                limit
              </strong>
              ,
              {' '}
              and is already booked at these times:
            </AlertTitle>
            <List>
              {times.map((time) => (
                <ListItem>
                  <ListItemText
                    primary={time}
                  />
                </ListItem>
              ))}
            </List>
          </>,
        );
      }
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, [amenities.length]);

  useEffect(() => {
    findReservations();
  }, [amenity, selectedStartDate]);

  const handleAmenityChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>): void => {
    const reserveAmenity = event.target.value;
    setAmenity(reserveAmenity);
    Object.keys(amenities).forEach((a) => {
      const loopAmenity = amenities[Number(a)];
      if (String(loopAmenity.id) === event.target.value) {
        setSelectedAmenityName(loopAmenity.name);
        setAmenityTime(loopAmenity.timeLimit);
      }
    });
  };

  const handleAnswerChange = (event: React.ChangeEvent<{ name?: string; checked: unknown }>): void => {
    if (event.target.checked) {
      const currentAnswers = answers;
      currentAnswers[Number(event.target.name)] = true;
      setAnswers(currentAnswers);
    } else {
      const currentAnswers = answers;
      currentAnswers[Number(event.target.name)] = false;
      setAnswers(currentAnswers);
    }
  };

  const handleNativeDateChange = (date: string): void => {
    const constDate = new Date(date);
    const tzo = new Date().getTimezoneOffset();
    const changedDate = moment(constDate).add(tzo, 'm').toDate();
    const startDate = new Date(
      changedDate.getFullYear(),
      changedDate.getMonth(),
      changedDate.getDate(),
      selectedStartDate?.getHours() || new Date().getHours(),
      selectedStartDate?.getMinutes() || new Date().getMinutes(),
    );
    setSelectedStartDateChange(startDate);

    const endDate = new Date(
      changedDate.getFullYear(),
      changedDate.getMonth(),
      changedDate.getDate(),
      selectedEndDate?.getHours() || new Date().getHours(),
      selectedEndDate?.getMinutes() || new Date().getMinutes(),
    );
    setSelectedEndDateChange(endDate);
  };

  const handleDateChange = (date: string | undefined): void => {
    let setDate = new Date();
    if (date) {
      setDate = new Date(date);
    }
    setSelectedDate(setDate);

    const startDate = new Date(
      setDate.getFullYear(),
      setDate.getMonth(),
      setDate.getDate(),
      selectedStartDate?.getHours(),
      selectedStartDate?.getMinutes(),
    );

    setSelectedStartDateChange(startDate);

    const endDate = new Date(
      setDate.getFullYear(),
      setDate.getMonth(),
      setDate.getDate(),
      selectedEndDate?.getHours() || new Date().getHours(),
      selectedEndDate?.getMinutes() || new Date().getMinutes(),
    );
    setSelectedEndDateChange(endDate);
  };

  const handleNativeStartTimeChange = (date: string): void => {
    const [hour, minute] = date.split(':');
    const startDate = new Date(
      selectedStartDate?.getFullYear() || new Date().getFullYear(),
      selectedStartDate?.getMonth() || new Date().getMonth(),
      selectedStartDate?.getDate() || new Date().getDate(),
      Number(hour),
      Number(minute),
    );

    setSelectedStartDateChange(roundToMinuteInterval(startDate, 15));
  };

  const handleStartDateChange = (date: string | undefined): void => {
    let setTime = new Date();
    if (date) {
      setTime = new Date(date);
    }

    const startDate = new Date(
      selectedDate?.getFullYear() || new Date().getFullYear(),
      selectedDate?.getMonth() || new Date().getMonth(),
      selectedDate?.getDate() || new Date().getDate(),
      setTime.getHours(),
      setTime.getMinutes(),
    );

    setSelectedStartDateChange(roundToMinuteInterval(startDate, 15));
  };

  const handleNativeEndTimeChange = (date: string): void => {
    const [hour, minute] = date.split(':');
    const endDate = new Date(
      selectedEndDate?.getFullYear() || new Date().getFullYear(),
      selectedEndDate?.getMonth() || new Date().getMonth(),
      selectedEndDate?.getDate() || new Date().getDate(),
      Number(hour),
      Number(minute),
    );

    setSelectedEndDateChange(roundToMinuteInterval(endDate, 15));
  };

  const handleEndDateChange = (date: string | undefined): void => {
    let setTime = new Date();
    if (date) {
      setTime = new Date(date);
    }

    const endDate = new Date(
      selectedDate?.getFullYear() || new Date().getFullYear(),
      selectedDate?.getMonth() || new Date().getMonth(),
      selectedDate?.getDate() || new Date().getDate(),
      setTime.getHours(),
      setTime.getMinutes(),
    );

    setSelectedEndDateChange(roundToMinuteInterval(endDate, 15));
  };

  const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
        width: '100%',
      },
    },
    registerButton: {
      backgroundColor: '#f37f30',
      color: 'white',
      marginBottom: '20px',
    },
    paper: {
      position: 'absolute',
      width: 400,
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
  }));

  const classes = useStyles();

  return (
    <div>
      { thanks && (
        <div className="section flex-grow">
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <h4 className="center">Amenity reserved</h4>
              <p className="center">
                Thank you!
                {'  '}
                <span role="img" aria-label="">🤟</span>
                Your reservation has been confirmed!
                {'  '}
              </p>
            </Grid>
            <Grid item xs={12} className="center">
              <Button
                variant="contained"
                className={classes.registerButton}
                onClick={(): void => {
                  setAvailability(null);
                  setThanks(false);
                  setSelectedStartDateChange(roundToMinuteInterval(new Date(), 15));
                  setSelectedEndDateChange(roundToMinuteInterval(addMinutes(selectedStartDate, 30), 15));
                }}
                startIcon={<EventAvailable />}
                type="submit"
              >
                Make Another Reservation
              </Button>
            </Grid>
            <Grid item xs={12} className="center">
              <Button
                variant="contained"
                onClick={(): void => navigate('/myreservations')}
                className={classes.registerButton}
                startIcon={<Schedule />}
                type="submit"
              >
                My Reservations
              </Button>
            </Grid>
          </Grid>
        </div>
      )}
      { !thanks && (
        <form className={classes.root} noValidate autoComplete="off" onSubmit={reserve}>
          <div className="section flex-grow">
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <h4 className="center">Reserve an Amenity</h4>
                { errorMessage && (
                  <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                  </Alert>
                )}
              </Grid>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <Grid item xs={6}>
                  <InputLabel htmlFor="age-native-simple">Amenity</InputLabel>
                  <Select
                    native
                    value={amenity}
                    onChange={handleAmenityChange}
                    inputProps={{
                      name: 'amenity',
                      id: 'amenity',
                    }}
                    style={{ width: '100%' }}
                  >
                    <option aria-label="None" value="" />
                    {amenities.map(
                      (amenityOption: Amenity) => (
                        <option key={amenityOption.id} value={String(amenityOption.id)}>{amenityOption.name}</option>
                      ),
                    )}
                  </Select>
                </Grid>
                <Grid item xs={6}>
                  { isMobile && (
                    <TextField
                      id="start"
                      label="Date"
                      type="date"
                      defaultValue={formatDate(selectedStartDate)}
                      onChange={(e): void => handleNativeDateChange(e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  )}
                  { !isMobile && (
                    <DatePicker
                      id="start"
                      value={selectedStartDate}
                      label="Date"
                      onChange={(e): void => handleDateChange(e?.toString())}
                      style={{ width: '100%' }}
                    />
                  )}
                </Grid>
                <Grid item xs={6}>
                  { isMobile && (
                    <TextField
                      id="startTime"
                      label="Start Time"
                      type="time"
                      value={formatTime(roundToMinuteInterval(selectedStartDate, 15))}
                      onChange={(e): void => handleNativeStartTimeChange(e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  )}
                  { !isMobile && (
                    <TimePicker
                      id="startTime"
                      value={roundToMinuteInterval(selectedStartDate, 15)}
                      label="Start Time"
                      onChange={(e): void => handleStartDateChange(e?.toString())}
                      style={{ width: '100%' }}
                      minutesStep={15}
                    />
                  )}
                </Grid>
                <Grid item xs={6}>
                  { isMobile && (
                    <TextField
                      id="endTime"
                      label="End Time"
                      type="time"
                      value={formatTime(roundToMinuteInterval(selectedEndDate, 15))}
                      onChange={(e): void => handleNativeEndTimeChange(e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  )}
                  { !isMobile && (
                    <TimePicker
                      id="endTime"
                      value={roundToMinuteInterval(selectedEndDate, 15)}
                      label="End Time"
                      onChange={(e): void => handleEndDateChange(e?.toString())}
                      style={{ width: '100%' }}
                      minutesStep={15}
                    />
                  )}
                </Grid>
                { availability && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      {availability}
                    </Alert>
                  </Grid>
                )}
                {amenity && questions[Number(amenity)].map(
                  (questionOption) => (
                    <Grid item xs={12} key={questionOption.id}>
                      <FormControlLabel
                        control={(
                          <Checkbox
                            checked={answers[questionOption.id]}
                            onChange={handleAnswerChange}
                            name={String(questionOption.id)}
                            color="primary"
                          />
                        )}
                        label={questionOption.question}
                      />
                    </Grid>
                  ),
                )}
                <Grid item xs={12}>
                  <Typography>
                    Please ensure that you follow the posted instructions as well as complying with the
                    {' '}
                    <Link href="https://wscc556.frontsteps.com/folders/" target="_blank" rel="noopener">
                      Arrow Lofts condo rules
                    </Link>
                    .
                  </Typography>
                </Grid>
                {amenity && (
                  <Grid item xs={12} className="center">
                    <Button
                      variant="contained"
                      type="submit"
                      className={classes.registerButton}
                      endIcon={<Icon>add</Icon>}
                    >
                      Reserve
                      {selectedAmenityName && (
                        <>
                          {'  '}
                          {selectedAmenityName}
                        </>
                      )}
                    </Button>
                  </Grid>
                )}
              </MuiPickersUtilsProvider>
            </Grid>
          </div>
        </form>
      )}
    </div>
  );
}
