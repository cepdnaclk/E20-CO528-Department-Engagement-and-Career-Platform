---
layout: home
permalink: index.html

# Please update this with your repository name and title
repository-name: E20-CO528-Department-Engagement-and-Career-Platform
title: Department Engagement & Career Platform (DECP)
---

[comment]: # "This is the standard layout for the project, but you can clean this and use your own template"

# DEPARTMENT ENGAGEMENT & CAREER PLATFORM (DECP)

---

## Team
- E/20/158, Chamuditha Jananga, [e20158@eng.pdn.ac.lk](mailto:e20158@eng.pdn.ac.lk)
- E/20/248, Tharindu Mapagedara, [e20248@eng.pdn.ac.lk](mailto:e20248@eng.pdn.ac.lk)
- E/20/453, Janith Yogesh, [e20453@eng.pdn.ac.lk](mailto:e20453@eng.pdn.ac.lk)
- E/20/300, Tharushika Prasadinie, [e20300@eng.pdn.ac.lk](mailto:e20300@eng.pdn.ac.lk)

## Table of Contents
1. [Introduction](#introduction)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Tech Stack](#tech-stack)
5. [Links](#links)

---

## Introduction

The Department Engagement & Career Platform (DECP) is a comprehensive networking platform designed for the Department of Computer Engineering at the University of Peradeniya. It connects students, alumni, faculty, and industry partners through social feeds, job boards, events, research collaboration, and real-time messaging.

## Architecture

The application uses a **Microservices Architecture** with three client layers:

```text
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  React Web   │   │ React Native │   │   (Future)   │
│  Frontend    │   │  Mobile App  │   │  Flutter App │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       └──────────┬───────┴──────────────────┘
                  ▼
         ┌────────────────┐
         │  API Gateway   │  Port 5000
         └───────┬────────┘
    ┌────┬───┬───┼───┬────┬────┬────┐
    ▼    ▼   ▼   ▼   ▼    ▼    ▼    ▼
  Auth Feed Jobs Events Research Msg Notif Analytics
  5001 5002 5003  5004   5005  5006 5007   5008
                  │
              MongoDB Atlas
```

### Backend Microservices
| Service | Port | Description |
|---|---|---|
| API Gateway | 5000 | Routes requests to downstream services |
| Auth Service | 5001 | Registration, login, JWT, profiles |
| Feed Service | 5002 | Posts, likes, comments |
| Jobs Service | 5003 | Job/internship listings, applications |
| Events Service | 5004 | Events, RSVP, workshops |
| Research Service | 5005 | Projects, collaborators, documents |
| Messaging Service | 5006 | Real-time chat via Socket.IO |
| Notifications Service | 5007 | In-app notification alerts |
| Analytics Service | 5008 | Admin dashboard statistics |

## Prerequisites
- **Node.js** v18+ ([download](https://nodejs.org/))
- **MongoDB Atlas** account (or local MongoDB)
- **Expo Go** app on your phone (for mobile testing)

## Tech Stack
| Layer | Technology |
|---|---|
| Web Frontend | React.js, Vite, CSS3 |
| Mobile App | React Native, Expo |
| API Gateway | Express.js, http-proxy-middleware |
| Microservices | Express.js, Mongoose |
| Database | MongoDB Atlas |
| Authentication | JWT (access + refresh tokens) |
| Real-time | Socket.IO |
| File Uploads | Multer |

## Links

- [Project Repository](https://github.com/cepdnaclk/{{ page.repository-name }}){:target="_blank"}
- [Project Page](https://cepdnaclk.github.io/{{ page.repository-name}}){:target="_blank"}
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)

[//]: # (Please refer this to learn more about Markdown syntax)
[//]: # (https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)
