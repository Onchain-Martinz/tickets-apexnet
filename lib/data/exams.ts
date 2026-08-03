import { ExamRecord, QuestionSupportingData, ScheduledExamRecord } from "@/lib/types/exams";

const topicsByCourse: Record<string, string[]> = {
  "PSY 105": [`ETHICS IN PSYCHOLOGY 

* UNDERSTANDING THE HUMAN MIND AND BEHAVIOR: THE PHILOSOPHICAL PERSPECTIVE 
* ETHICS - INTRODUCTION TO ETHICS IN PSYCHOLOGY 
* ETHICAL THEORIES 
* ETHICS IN SCIENTIFIC RESEARCH 
* REDRESSING UNETHICAL BEHAVIOR 
* LOBBYING IN PROMOTING PSYCHOLOGY IN PUBLIC SPACE 
* INTEGRITY IN PSYCHOLOGICAL PRACTICE 
* EMOTIONAL INTELLIGENCE 
* INATTENTIONAL BLINDNESS OR INATTENTIONAL AMNESIA 
* UNDERSTANDING HUMAN MEMORY`],
  "GST 111": [`GST 111

* ENGLISH LANGUAGE SOUND PATTERNS 
* CLASSES OF ENGLISH LANGUAGE WORDS
* THE SENTENCES IN ENGLISH LANGUAGE 
* ENGLISH GRAMMAR AND USAGE TENSE, MOOD, MODALITY AND CONCORD 
* WRITING ACTIVITIES IN ENGLISH LANGUAGE 
* COMPREHENSION STRATEGIES IN ENGLISH LANGUAGE`],
  "SOC 101": [`SOCIOLOGY 

* DEFINITION OF SOCIOLOGY 
* RELATIONSHIP BETWEEN SOCIOLOGY AND OTHER SOCIAL SCIENCES 
* THE SCIENTIFIC NATURE OF SOCIOLOGY 
* METHOD OF SOCIAL RESEARCH 
* AIMS  AND SCOPE OF SOCIAL RESEARCH `],
  "IGB 107": [`IGB 107

* MMALITE
* MMALITE IDE NA IMU ASUSU IGBO
* MKPURUUDAASUSU NA MKPURUEDEMEDE 
* OGAN OKWU/NJIAKPO
* UDAUME NA NDAKORITA UDAUME
* MYIRIUDAUME
* MGBAKWUNYE
* MKPURUOKWU, MMEDE OKWU NA MMUBAOKWU
* OLULO NANDAPU UDAUME
* NKEJIOKWU
* NKEJI ASUSU
* NKEJIASUSU NDIOZO
* NKEBIOKWU
* AHIRIOKWU
* UDAOLU IGBO
* AKARA EDEMEDE`],
  "PSY 103": [`LEARNING PROCESS 

* MEANING AND NATURE OF LEARNING 
* HISTORICAL BEGINNING OF LEARNING 
* MOTIVATION AND LEARNING 
* THEORY OF LEARNING 
* MEMORY
* FORGETTING AND RETRIEVAL OF INFORMATION 
* AMNESIA
* ARTIFICIAL INTELLIGENCE (HE DIDN'T TOUCH IT)`],
  "BIO 101": [`BIOLOGY 

* CELL STRUCTURE AND ORGANISMS 
* Functions of the Cell
* LIVING ORGANISMS AND ThEIR GENERAL REPRODUCTION 
* INTERRELATIONSHIP OR ASSOCIATION BETWEEN ORGANISMS 
* HEREDITARY AND EVOLUTION 
* Habitat, characteristics and life - ECOLOGY`],
  "PSY 117": [`COMMUNITY PSYCHOLOGY 

* INTRODUCTION TO COMMUNITY PSYCHOLOGY 
* History, Systems and Goals of community psychology 
* Research methods in community psychology 
* Socio-cultural factors in psychopathology 
* Community humanitarian and social services`],
  "PSY 101": [`INTRODUCTION TO PSYCHOLOGY 

* THE CONCEPT OF PSYCHOLOGY 
* HISTORICAL DEVELOPMENT OF PSYCHOLOGY 
* GOALS OF PSYCHOLOGY 
* MAJOR SCHOOLS OF PSYCHOLOGY 
* THE SCIENTIFIC METHOD OF STUDYING BEHAVIOR 
* RELATIONSHIP BETWEEN PSYCHOLOGY AND OTHER SCIENCES AND DISCIPLINES
* MAJOR BRANCHES OF PSYCHOLOGY 
* HUMAN NEEDS
* EMOTIONS 
* LEARNING 
* ANXIETY`],
  "PSY 119": [`CRIME AND DELINQUENCY 

* THE CONCEPT OF DELINQUENCY 
* THE NIGERIAN JUVENILE JUSTICE SYSTEM 
* CAUSAL AND ASSOCIATED FACTORS IN JUVENILE DELINQUENCY 
* THEORIES OF JUVENILE DELINQUENCY 
* PREVENTION OF JUVENILE DELINQUENCY`],
  "PSY 115": [`ETHNICITY AND ETHNIC GROUP 

* ETHNICITY MEANING, APPROACH, CHARACTERISTICS AND STAGES
* Meaning of ethnic group 
* Types of Ethnic group 
* Ethnic conflict, causes, solution to ethnic conflict 
* PREJUDICES AND STEREOTYPE 
* Types of prejudices 
* Component of prejudice 
* Ways of reducing prejudices 
* Stereotypes - meaning, approaches, and strategies in reducing stereotypes
* NATION BUILDING AND NATIONALISM 
* Basic factors to nation building 
* Condition and challenges to nation building 
* Nationalism and goals of nationalism
* ETHNIC CRISES`],
  "PSY 111": [`QUANTITATIVE METHOD IN PSYCHOLOGY 

* DATA PRESENTATION 
* Tabular form
* Construction of the frequency distribution table 
* GRAPHICAL PRESENTATION 
* Histogram 
* Bar charts 
* Pie chart
* Frequency polygon 
* Cumulative frequency polygon (ogive)
* Percentage ogive
* MEASURES OF CENTRAL TENDENCY 
* Mean
* Median 
* Mode
* Range
* Variance 
* Standard deviation 
* Quartile 
* Semi-Inter quartile range 
* Mean deviation 
* SCALE OF MEASUREMENT`],
  "PSY 123": [`SPORTS PSYCHOLOGY 

* Meaning of sports psychology 
* Relevance and Aims of sports psychology 
* EMOTIONS 
* Roles and Sources of Emotions in athlete sport settings 
* MOTIVATION 
* Types of motivation 
* ANXIETY 
* Causes, Effects/signs/Symptoms of Anxiety in sports
* Manifestation of Anxiety in sports settings 
* Treatment approaches to anxiety`]
};

type ArchivedExamSource = Omit<
  ExamRecord,
  "session" | "semester" | "level" | "status" | "examVenue"
>;

const archivedFirstSemesterSource: ArchivedExamSource[] = [
  {
    slug: "psy-103",
    courseCode: "PSY 103",
    courseTitle: "Learning Process",
    date: "2026-03-25",
    time: "12 PM – 2 PM",
    topicsToRead: topicsByCourse["PSY 103"],
    pastQuestions: {
      instruction: "Instruction: Answer any 4 questions",
      items: [
        "1. (A) Discuss the term Learning.\n(B) List and explain 5 characteristics of learning.",
        "2. (A) What is Classical Conditioning?\n(B) Explain 4 principles of Classical Conditioning.",
        "3. (A) List and explain 4 principles of Operant Conditioning.\n(B) Explain the 4 basic schedules of reinforcement.",
        "4. (A) List and explain 2 types of amnesia.\n(B) Explain 4 ways of preventing amnesia.",
        "5. (A) Discuss any 4 types of learning disability.\n(B) Discuss 4 ways of helping individuals with learning disability.",
        "6. Explain 4 factors that affect retrieval of information from memory."
      ]
    }
  },
  {
    slug: "psy-111",
    courseCode: "PSY 111",
    courseTitle: "Quantitative Method in Psychology",
    date: "2026-03-25",
    time: "3 PM – 6 PM",
    topicsToRead: topicsByCourse["PSY 111"],
    pastQuestions: {
      instruction: "Instruction: Answer four questions",
      items: [
        "Question 1\n\nThe following table shows loads in kilonewtons supported by a sample of 98 cables manufactured by DanyElia Groups.\n\nLoad 92–96 97–101 102–106 107–111 112–116 117–121\nNo. of Cables 10 15 19 24 18 12\n\ni. Compute the Mean using the coded value A = 104 / 5.\nii. Obtain the Cumulative Frequency (CF).\niii. Determine the class size.\niv. What is the upper boundary limit of the 3rd class?",
        "Question 2\n\nUsing the data of Question 1 compute:\n\na. 50th Percentile\nb. Mode",
        "Question 3\n\nSupposing the data below represents the Statutory Revenue Allocation to Local Governments (in billions) according to zones from Jan–Dec 2022\n\nLocal Govts Oru East Mbaitoli Orlu Mbaise Ikeduru\nAllocation (Billions) 5.9 2.3 3.4 2.5 2.7\n\na. Present the information in a pie chart.\nb. Discuss 3 methods of presenting statistical data.",
        "Question 4\n\nDetermine the following from the frequency table provided in Q1 above:\n\na. Mode\nb. Median\nc. Convert 0.6428 to percentage",
        "Question 5\n\nThe score of 35 students that took an assessment test on Law 121 is shown below:\n\n23, 36, 40, 28, 31, 39, 27, 44, 32,\n48, 37, 33, 30, 57, 38, 29, 24, 26,\n24, 38, 36, 23, 19, 42, 30, 50, 18, 22,\n32, 28, 34, 38, 35, 41, 27\n\na. Present the information in a Grouped Frequency Distribution Table.\n\nb. Discuss the Scales of Measurement known to you.",
        "Question 6\n\nUsing the data of Question 5 compute the following measures:\n\na. Variance\nb. Mean Deviation"
      ]
    }
  },
  {
    slug: "psy-101",
    courseCode: "PSY 101",
    courseTitle: "Introduction to Psychology",
    date: "2026-03-26",
    time: "12 PM – 2 PM",
    topicsToRead: topicsByCourse["PSY 101"],
    pastQuestions: {
      instruction: "Instruction: Answer only four questions",
      items: [
        "1. (a) Amidst the seeming complexities surrounding human behaviours, it is still a fact that both human and animals’ behaviours are controlled by simple elements. Identify three of such elements and briefly discuss one.\n(b) Human learning is a continuous life process. Briefly explain the point at which you would accept that learning has taken place.",
        "2. (a) Daily life realities show that human needs are numerous and insatiable. Briefly discuss two basic human needs.\n(b) Identify two major goals of psychology and briefly discuss one.",
        "3. (a) Human behaviours can be simply divided into two broad forms. With three easy-to-understand points separate normal behaviours from abnormal ones.\n(b) The study of human behavior follows the principles of major scientific methods. Identify three of such methods and briefly discuss one.",
        "4. (a) No two individuals are behaviourally the same. Briefly discuss any two major factors responsible for individual differences among identical twins.\n(b) Briefly explain two ways that what is learned can be easily retained and retrieved when needed.",
        "5. (a) Identify two forms of human memory and discuss one.\n(b) Identify any four branches of psychology and briefly explain any two.",
        "6. (a) Psychology is seen in some quarters as a magic. With two points show your agreement or disagreement with this statement.\n(b) Briefly explain any three of the following concepts as used in this course:\n• Personality\n• Emotions\n• Attitudes\n• Memory\n• Behavior\n• Psychology"
      ]
    }
  },
  {
    slug: "psy-119",
    courseCode: "PSY 119",
    courseTitle: "Psychology of Crime & Delinquency",
    date: "2026-03-27",
    time: "3 PM – 6 PM",
    topicsToRead: topicsByCourse["PSY 119"],
    pastQuestions: {
      instruction: "Instruction: Answer any 4 questions",
      items: [
        "1. Discuss four characteristics of criminal law.",
        "2. (i) Define Crime.\n(ii) Discuss four sources of criminal law.",
        "3. State and describe five types of crime stated in the Nigerian criminal code and the specific punishment associated with each.",
        "4. Discuss four causal factors that predispose or precipitate crime and delinquency.",
        "5. Discuss and evaluate the radical and social conflict theory of crime and delinquency.",
        "6. Discuss four ways of preventing juvenile delinquency."
      ]
    }
  },
  {
    slug: "psy-115",
    courseCode: "PSY 115",
    courseTitle: "Psychology of Ethnicity & Ethnic Groups",
    date: "2026-04-01",
    time: "8 AM – 11 AM",
    topicsToRead: topicsByCourse["PSY 115"],
    answerReveals: [
      {
        questionNumber: 1,
        question: "Discuss 3 components of prejudice and the nature of their manifestation.",
        answer:
          "The three components of prejudice are: Cognitive component — this is made up of stereotypes or beliefs about a group. It appears when people assume all members of a group share the same traits. Affective component — this refers to feelings or emotions toward a group, such as hatred, fear, dislike, or suspicion. Behavioural component — this is the action part and appears as discrimination, exclusion, verbal abuse, unfair treatment, or violence against members of the group."
      },
      {
        questionNumber: 2,
        question: "Discuss 2 types of ethnic identity.",
        answer:
          "Strong/positive ethnic identity — when a person is proud of their ethnic group, values its language, culture, and traditions, and sees belonging as important. Weak/negative ethnic identity — when a person feels detached, ashamed, confused, or indifferent about their ethnic group and may reject its customs or values."
      },
      {
        questionNumber: 3,
        question: "Explain 5 strategic ways of reducing ethnic conflicts in Nigeria.",
        answer:
          "Promotion of justice and fairness in appointments, allocation of resources, and political representation. Good governance to reduce marginalization and distrust. Inter-ethnic dialogue and peace education to build understanding and tolerance. Economic development and equal opportunities to reduce competition and resentment. Effective law enforcement so hate speech, violence, and discrimination are punished."
      },
      {
        questionNumber: 4,
        question: "With appropriate examples discuss 6 challenges to nation building in Nigeria.",
        answer:
          "Ethnic rivalry — groups often place ethnic loyalty above national unity. Religious intolerance — religious clashes weaken national integration. Corruption — public resources are diverted instead of used for development. Poor leadership — bad leadership creates instability and division. Marginalization and inequality — some groups feel excluded from power and development. Insecurity and violence — communal clashes, insurgency, and banditry weaken unity. Example: conflict over political appointments or resource control often creates tension among ethnic groups."
      },
      {
        questionNumber: 5,
        question: "With appropriate examples illustrate 4 manifestations of ethnic hatred in Nigeria.",
        answer:
          "Discrimination in employment or admissions based on ethnic origin. Hate speech and ethnic insults in politics and media. Communal clashes and violence between ethnic groups. Social exclusion or segregation where people refuse to associate, trade, or marry across groups. Example: refusing to rent a house or offer a job to someone because of their ethnic group."
      },
      {
        questionNumber: 6,
        question: "Discuss any 5 ways in which xenophobia can be reduced.",
        answer:
          "Public education and awareness against fear of foreigners. Promotion of tolerance and multicultural values. Fair immigration policies that balance security with human dignity. Economic inclusion so foreigners are not seen only as threats. Dialogue and social integration programmes between locals and migrants."
      }
    ],
    topicKeyPoints: [
      {
        topic: "ETHNICITY MEANING, APPROACH, CHARACTERISTICS AND STAGES",
        points: [
          "Ethnicity refers to a sense of belonging based on common language, ancestry, culture, religion, or history.",
          "It is a social identity that shapes group loyalty and behaviour.",
          "Characteristics: common origin, shared culture, group consciousness, and distinct identity.",
          "Stages may move from ethnic awareness to ethnic solidarity, competition, and sometimes conflict."
        ]
      },
      {
        topic: "Meaning of ethnic group",
        points: [
          "An ethnic group is a group of people who share common ancestry, traditions, language, and cultural values.",
          "Members see themselves as distinct from others."
        ]
      },
      {
        topic: "Types of Ethnic group",
        points: [
          "Majority ethnic groups",
          "Minority ethnic groups",
          "Indigenous/native groups",
          "Migrant/settler ethnic groups"
        ]
      },
      {
        topic: "Ethnic conflict, causes, solution to ethnic conflict",
        points: [
          "Causes: competition for resources, marginalization, bad leadership, prejudice, political manipulation.",
          "Solutions: dialogue, justice, inclusive governance, peace education, balanced development."
        ]
      },
      {
        topic: "PREJUDICES AND STEREOTYPE",
        points: [
          "Prejudice is a negative attitude toward a group.",
          "Stereotype is a fixed generalized belief about a group.",
          "Prejudice often produces discrimination."
        ]
      },
      {
        topic: "Types of prejudices",
        points: [
          "Ethnic prejudice",
          "Religious prejudice",
          "Gender prejudice",
          "Class prejudice",
          "Racial prejudice"
        ]
      },
      {
        topic: "Component of prejudice",
        points: ["Cognitive", "Affective", "Behavioural"]
      },
      {
        topic: "Ways of reducing prejudices",
        points: [
          "Education",
          "Intergroup contact",
          "Equal opportunities",
          "Fair laws",
          "Positive media representation"
        ]
      },
      {
        topic: "Stereotypes - meaning, approaches, and strategies in reducing stereotypes",
        points: [
          "Meaning: overgeneralized belief about a group.",
          "Reduction: exposure, critical thinking, education, interaction, and fair representation."
        ]
      },
      {
        topic: "NATION BUILDING AND NATIONALISM",
        points: [
          "Nation building means creating unity, loyalty, and development in a state.",
          "Nationalism is devotion to one’s nation above sectional loyalties."
        ]
      },
      {
        topic: "Basic factors to nation building",
        points: [
          "Justice",
          "Good leadership",
          "Security",
          "Equal opportunity",
          "Shared national identity"
        ]
      },
      {
        topic: "Condition and challenges to nation building",
        points: [
          "Conditions: peace, fairness, strong institutions, participation.",
          "Challenges: corruption, ethnic crisis, inequality, insecurity, poor governance."
        ]
      },
      {
        topic: "Nationalism and goals of nationalism",
        points: ["Goals: unity, sovereignty, pride, collective progress, self-determination."]
      },
      {
        topic: "ETHNIC CRISES",
        points: [
          "Ethnic crises are violent or tense confrontations between ethnic groups.",
          "Often caused by competition, prejudice, land disputes, or political manipulation."
        ]
      }
    ],
    pastQuestions: {
      instruction: "Instruction: Answer any 4 questions",
      items: [
        "1. Discuss 3 components of prejudice and the nature of their manifestation.",
        "2. Discuss 2 types of ethnic identity.",
        "3. Explain 5 strategic ways of reducing ethnic conflicts in Nigeria.",
        "4. With appropriate examples discuss 6 challenges to nation building in Nigeria.",
        "5. With appropriate examples illustrate 4 manifestations of ethnic hatred in Nigeria.",
        "6. Discuss any 5 ways in which xenophobia can be reduced."
      ]
    }
  },
  {
    slug: "psy-123",
    courseCode: "PSY 123",
    courseTitle: "Sport Psychology",
    date: "2026-04-07",
    time: "8 AM – 11 AM",
    topicsToRead: topicsByCourse["PSY 123"],
    answerReveals: [
      {
        questionNumber: "1(a)",
        question: "As a psychologist, enumerate five factors that promote motivation in sports.",
        answer:
          "Goal setting. Rewards and recognition. Positive coaching and encouragement. Self-confidence and belief in success. Good team spirit and social support."
      },
      {
        questionNumber: "1(b)",
        question:
          "There are many factors directly involved in sports performance ranging from psychological factors to physical characteristics. Discuss the roles of sports psychologist in sports performance.",
        answer:
          "A sports psychologist helps athletes improve motivation, confidence, concentration, emotional control, stress management, and team cohesion. They teach mental skills such as goal setting, relaxation, imagery, self-talk, and coping strategies. They also help injured athletes recover psychologically and help coaches understand athletes’ mental needs."
      },
      {
        questionNumber: "2(a)",
        question:
          "Identify five techniques that enhance athlete’s performance in sports competition.",
        answer:
          "Goal setting. Mental imagery/visualization. Relaxation techniques. Positive self-talk. Concentration and attention control training."
      },
      {
        questionNumber: "2(b)",
        question: "List five objectives of sport coaching.",
        answer:
          "Skill development. Physical fitness improvement. Discipline and sportsmanship. Team coordination. Performance improvement and achievement of goals."
      },
      {
        questionNumber: "2(c)",
        question: "Discuss the relevance of sports psychology in the world of sports.",
        answer:
          "Sports psychology helps athletes perform better by improving mental readiness, motivation, confidence, and emotional control. It helps reduce anxiety, manage pressure, improve focus, and build team spirit. It is relevant because success in sports depends on both physical and psychological preparation."
      },
      {
        questionNumber: "3(a)",
        question: "Discuss five sources of emotions in sports settings known to you.",
        answer:
          "Competition pressure. Fear of failure. Crowd reaction. Coaching style and criticism. Injury or threat of injury."
      },
      {
        questionNumber: "3(b)",
        question: "Enumerate the importance of coaching in sports.",
        answer:
          "Improves skills. Builds discipline. Boosts confidence. Guides tactics and strategy. Promotes teamwork and motivation."
      },
      {
        questionNumber: 4,
        question: "Identify the 4 C’s and discuss their importance in sports performance.",
        answer:
          "The 4 C’s are: Confidence — belief in one’s ability to succeed. Control — ability to manage emotions and reactions. Commitment — determination to keep working toward goals. Concentration — ability to focus attention on the task. They are important because they improve consistency, mental toughness, and performance under pressure."
      },
      {
        questionNumber: 5,
        question:
          "Identify 5 effective strategies used by therapists to treat competition anxiety.",
        answer:
          "Relaxation training. Cognitive restructuring. Deep breathing exercises. Mental imagery. Positive self-talk."
      },
      {
        questionNumber: "6(a)",
        question:
          "As a sport psychologist, identify ways anxiety can manifest among sports men and women and discuss only two forms identified.",
        answer:
          "Anxiety can manifest as cognitive anxiety, somatic/physical anxiety, and behavioural signs. Cognitive anxiety includes fear, worry, negative thoughts, and poor concentration. Somatic anxiety includes sweating, trembling, rapid heartbeat, dry mouth, and muscle tension."
      },
      {
        questionNumber: "6(b)",
        question: "Enumerate three main causes of anxiety.",
        answer:
          "Fear of failure. High expectations from self, coach, or fans. Lack of preparation or uncertainty."
      },
      {
        questionNumber: "6(c)",
        question:
          "Briefly discuss two psychological strategies to reduce pre-performance anxiety and enhance optimum performance.",
        answer:
          "Relaxation training helps reduce physical tension and calm the body before competition. Positive self-talk helps replace fear and doubt with confidence and focus."
      }
    ],
    topicKeyPoints: [
      {
        topic: "Meaning of sports psychology",
        points: [
          "Sports psychology is the study of how psychological factors affect sports performance and how participation in sport affects the mind."
        ]
      },
      {
        topic: "Relevance and Aims of sports psychology",
        points: [
          "Improve performance",
          "Increase motivation",
          "Reduce anxiety",
          "Build confidence",
          "Improve team spirit and adjustment"
        ]
      },
      {
        topic: "EMOTIONS",
        points: [
          "Emotions influence performance positively or negatively.",
          "Examples: excitement, anger, fear, joy, frustration."
        ]
      },
      {
        topic: "Roles and Sources of Emotions in athlete sport settings",
        points: [
          "Sources: crowd, pressure, coach, injury, opponent, expectations.",
          "Emotions can energize or disrupt performance."
        ]
      },
      {
        topic: "MOTIVATION",
        points: ["Motivation is the force that drives an athlete to participate and persist."]
      },
      {
        topic: "Types of motivation",
        points: ["Intrinsic motivation", "Extrinsic motivation"]
      },
      {
        topic: "ANXIETY",
        points: ["Anxiety is a state of fear, tension, or worry before or during competition."]
      },
      {
        topic: "Causes, Effects/signs/Symptoms of Anxiety in sports",
        points: [
          "Causes: fear of failure, pressure, poor preparation",
          "Signs: sweating, trembling, rapid heartbeat, poor focus"
        ]
      },
      {
        topic: "Manifestation of Anxiety in sports settings",
        points: ["Cognitive", "Somatic", "Behavioural"]
      },
      {
        topic: "Treatment approaches to anxiety",
        points: [
          "Relaxation",
          "Self-talk",
          "Imagery",
          "Breathing control",
          "Cognitive therapy"
        ]
      }
    ],
    pastQuestions: {
      instruction: "Instruction: Answer four questions",
      items: [
        "1. In sports performance, there is a kind of expectation/motivation an individual has towards sports activity.\n(a) As a psychologist, enumerate five factors that promote motivation in sports.\n(b) There are many factors directly involved in sports performance ranging from psychological factors to physical characteristics. Discuss the roles of sports psychologist in sports performance.",
        "2.\n(a) Identify five techniques that enhance athlete’s performance in sports competition.\n(b) List five objectives of sport coaching.\n(c) Discuss the relevance of sports psychology in the world of sports.",
        "3. (a) Discuss five sources of emotions in sports settings known to you.\n(b) Enumerate the importance of coaching in sports.",
        "4. The increased stress of competition can cause athletes to react both physically and mentally in ways that can negatively affect performance abilities. Consequently, identify the 4 C’s and discuss the importance of the 4 C’s in sports performance.",
        "5. As the same time as providing challenge and stimulation, sport also provides considerable uncertainty. The uncertainty may motivate others and induce anxiety in some athletes. Identify 5 effective strategies used by therapists to treat competition anxiety.",
        "6. There are various ways anxiety can manifest among sports men and women.\n(a) As a sport psychologist, identify them and discuss only two forms identified.\n(b) Enumerate three main causes of anxiety.\n(c) Briefly discuss two psychological strategies to reduce pre-performance anxiety and enhance optimum performance."
      ]
    }
  },
  {
    slug: "psy-117",
    courseCode: "PSY 117",
    courseTitle: "Community Psychology",
    date: "2026-04-07",
    time: "3 PM – 6 PM",
    topicsToRead: topicsByCourse["PSY 117"],
    answerReveals: [
      {
        questionNumber: "1(a)",
        question: "What do you understand by humanitarian services and social services?",
        answer:
          "Humanitarian services are services aimed at relieving suffering and protecting human welfare during hardship, crisis, or need. Social services are organized services provided to improve the welfare and quality of life of individuals and communities, such as health, education, housing, and counselling."
      },
      {
        questionNumber: "1(b)",
        question:
          "In the light of (1a) above, discuss the essence of traditional social welfare in Africa.",
        answer:
          "Traditional social welfare in Africa is based on communal support, kinship, and collective responsibility. Its essence lies in helping the poor, sick, aged, widows, orphans, and other vulnerable persons through family and community networks. It promotes solidarity, mutual aid, belongingness, and social stability."
      },
      {
        questionNumber: "2(a)",
        question: "Outline at least two of these socio-economic problems.",
        answer:
          "Poverty. Unemployment. Other acceptable examples: poor housing, crime, drug abuse, poor sanitation."
      },
      {
        questionNumber: "2(b)",
        question:
          "Briefly discuss them indicating also their causes, effects and possible solutions.",
        answer:
          "Poverty is caused by unemployment, poor governance, and low income. It leads to crime, poor health, and low standard of living. Solutions include job creation, empowerment, and social support. Unemployment is caused by weak economy, lack of skills, and population growth. It leads to frustration, dependency, and crime. Solutions include vocational training, entrepreneurship, and industrial development."
      },
      {
        questionNumber: "3(a)",
        question: "State at least three major goals of community psychology.",
        answer:
          "Prevention of social and mental health problems. Promotion of well-being and empowerment. Community participation and social change."
      },
      {
        questionNumber: "3(b)",
        question:
          "With relevant illustrations state and explain three major preventive programmes that community psychologists can embark on.",
        answer:
          "Health education programmes — to prevent disease and unhealthy behaviour. Drug abuse prevention programmes — to reduce substance misuse. School/community counselling and awareness programmes — to prevent emotional, behavioural, and social problems."
      },
      {
        questionNumber: "3(c)",
        question:
          "Outline three criteria that a programme must meet to be considered a primary preventive programme.",
        answer:
          "It targets a whole population or at-risk group before the problem occurs. It aims at prevention rather than treatment. It promotes healthy functioning and resilience."
      },
      {
        questionNumber: "4(a)",
        question: "Vividly explain comprehensively the course “Community Psychology”.",
        answer:
          "Community psychology is a branch of psychology concerned with the relationship between individuals and their social environments. It focuses on prevention, empowerment, social justice, and solving community problems through research, intervention, and participation rather than waiting to treat problems after they arise."
      },
      {
        questionNumber: "4(b)",
        question: "Enumerate with at least three points the essence of the course.",
        answer:
          "It promotes prevention rather than cure. It empowers communities to solve problems. It encourages social justice and improved welfare."
      },
      {
        questionNumber: 5,
        question: "List and explain three methods of data collection.",
        answer:
          "Observation — watching behaviour or events directly. Interview — asking respondents questions directly. Questionnaire — collecting written responses from participants."
      },
      {
        questionNumber: 6,
        question:
          "As a would-be adviser in a government parastatal or private agency that has the well-being of citizens in mind, x-ray at least three research methods that a community psychologist can master in order to do a satisfactory work.",
        answer:
          "Survey method — useful for collecting data from many people. Case study method — useful for detailed study of individuals or communities. Participant observation/field study — useful for understanding real community life and behaviour."
      }
    ],
    topicKeyPoints: [
      {
        topic: "INTRODUCTION TO COMMUNITY PSYCHOLOGY",
        points: [
          "Focuses on people in their environment.",
          "Emphasizes prevention, empowerment, and community participation."
        ]
      },
      {
        topic: "History, Systems and Goals of community psychology",
        points: [
          "Emerged as a response to limits of individual treatment alone.",
          "Goals: prevention, empowerment, justice, and social welfare."
        ]
      },
      {
        topic: "Research methods in community psychology",
        points: [
          "Observation",
          "Interview",
          "Questionnaire",
          "Survey",
          "Case study",
          "Field research"
        ]
      },
      {
        topic: "Socio-cultural factors in psychopathology",
        points: ["Poverty", "stigma", "family breakdown", "cultural beliefs", "social exclusion"]
      },
      {
        topic: "Community humanitarian and social services",
        points: [
          "welfare support",
          "relief services",
          "counselling",
          "health outreach",
          "support for vulnerable groups"
        ]
      }
    ],
    pastQuestions: {
      instruction: "Instruction: Answer any 4 questions",
      items: [
        "1. (a) What do you understand by humanitarian services and social services?\n(b) In the light of (1a) above, discuss the essence of traditional social welfare in Africa.",
        "2. Taking a look at most towns in Nigeria, a lot of socio-economic problems are observed.\n(a) Outline at least two of these socio-economic problems.\n(b) Briefly discuss them indicating also their causes, effects and possible solutions.",
        "3. (a) State at least three major goals of community psychology.\n(b) With relevant illustrations state and explain three major preventive programmes that community psychologists can embark on.\n(c) Outline three criteria that a programme must meet to be considered a primary preventive programme.",
        "4. (a) Vividly explain comprehensively the course “Community Psychology”.\n(b) Enumerate with at least three points the essence of the course.",
        "5. List and explain three methods of data collection.",
        "6. As a would-be adviser in a government parastatal or private agency that has the well-being of citizens in mind, x-ray at least three research methods that a community psychologist can master in order to do a satisfactory work."
      ]
    }
  },
  {
    slug: "bio-101",
    courseCode: "BIO 101",
    courseTitle: "Biology",
    date: "2026-04-08",
    time: "8 AM – 11 AM",
    topicsToRead: topicsByCourse["BIO 101"],
    answerReveals: [
      {
        questionNumber: "1(a)",
        question: "What is pathology?",
        answer:
          "Pathology is the study of diseases, their causes, processes, development, and effects on living organisms."
      },
      {
        questionNumber: "1(b)",
        question: "What is Klinefelter syndrome?",
        answer:
          "Klinefelter syndrome is a chromosomal disorder in which a male has an extra X chromosome, usually written as XXY."
      },
      {
        questionNumber: "1(c)",
        question: "State 4 types of chromosome mutation.",
        answer: "Deletion. Duplication. Inversion. Translocation."
      },
      {
        questionNumber: "2(a)",
        question: "Give an example of an organism that is: Acellular • Bilaterally symmetrical",
        answer: "Acellular: Virus. Bilaterally symmetrical: Earthworm or flatworm."
      },
      {
        questionNumber: "2(b)",
        question: "Describe the characteristics of Platyhelminthes.",
        answer:
          "They are flat-bodied, bilaterally symmetrical, triploblastic, unsegmented, and many are parasitic. They have no true coelom and possess simple organ systems."
      },
      {
        questionNumber: "2(c)",
        question: "Name a disease associated with Platyhelminthes.",
        answer: "Tapeworm infection or schistosomiasis."
      },
      {
        questionNumber: "3(a)",
        question: "Mention any 4 biological factors that determine ecological distribution.",
        answer: "Food availability. Predators. Competition. Disease/parasites."
      },
      {
        questionNumber: "3(b)",
        question: "Distinguish between commensalism and parasitism.",
        answer:
          "In commensalism, one organism benefits while the other is neither harmed nor helped. In parasitism, one organism benefits while the host is harmed."
      },
      {
        questionNumber: 4,
        question: "Draw and label a typical plant cell showing 10–15 parts.",
        answer:
          "Key parts to label: Cell wall, cell membrane, cytoplasm, nucleus, nucleolus, chloroplast, vacuole, mitochondrion, ribosome, rough endoplasmic reticulum, smooth endoplasmic reticulum, Golgi apparatus, plasmodesmata, tonoplast, nuclear membrane."
      },
      {
        questionNumber: "5(a)",
        question: "Outline the five kingdoms of living organisms.",
        answer: "Monera. Protista. Fungi. Plantae. Animalia."
      },
      {
        questionNumber: "5(b)",
        question: "Briefly discuss the kingdoms living organisms are classified into.",
        answer:
          "Monera — simple prokaryotes like bacteria. Protista — mostly unicellular eukaryotes like amoeba. Fungi — non-photosynthetic organisms like mushrooms. Plantae — multicellular photosynthetic organisms. Animalia — multicellular organisms that feed on other organisms."
      },
      {
        questionNumber: 6,
        question:
          "Define the following terms: Allele • Gene locus • Dominant and recessive gene • State the two laws of Mendel • State the three Mendelian gene genotypes",
        answer:
          "Allele — an alternative form of a gene. Gene locus — the specific position of a gene on a chromosome. Dominant gene — a gene expressed even in a heterozygous state. Recessive gene — a gene expressed only when paired with another recessive gene. Two laws of Mendel — law of segregation and law of independent assortment. Three Mendelian genotypes — homozygous dominant, heterozygous, homozygous recessive."
      }
    ],
    topicKeyPoints: [
      {
        topic: "CELL STRUCTURE AND ORGANISMS",
        points: ["Cell is the basic unit of life.", "Organisms may be unicellular or multicellular."]
      },
      {
        topic: "Functions of the Cell",
        points: ["metabolism", "reproduction", "respiration", "excretion", "growth"]
      },
      {
        topic: "LIVING ORGANISMS AND THEIR GENERAL REPRODUCTION",
        points: [
          "reproduction may be sexual or asexual",
          "it ensures continuity of species"
        ]
      },
      {
        topic: "INTERRELATIONSHIP OR ASSOCIATION BETWEEN ORGANISMS",
        points: ["mutualism", "commensalism", "parasitism", "competition", "predation"]
      },
      {
        topic: "HEREDITARY AND EVOLUTION",
        points: [
          "heredity explains transmission of traits",
          "evolution explains gradual change over time"
        ]
      },
      {
        topic: "Habitat, characteristics and life - ECOLOGY",
        points: [
          "ecology studies organisms and environment",
          "habitat is the natural home of an organism"
        ]
      }
    ],
    pastQuestions: {
      instruction: "Instruction: Answer any four questions",
      items: [
        "1. (a) What is pathology?\n(b) What is Klinefelter syndrome?\n(c) State 4 types of chromosome mutation.",
        "2. (a) Give an example of an organism that is:\n• Acellular\n• Bilaterally symmetrical\n(b) Describe the characteristics of Platyhelminthes.\n(c) Name a disease associated with Platyhelminthes.",
        "3. (a) Mention any 4 biological factors that determine ecological distribution.\n(b) Distinguish between commensalism and parasitism.",
        "4. Draw and label a typical plant cell showing 10–15 parts.",
        "5. (a) Outline the five kingdoms of living organisms.\n(b) Briefly discuss the kingdoms living organisms are classified into.",
        "6. Define the following terms:\n• Allele\n• Gene locus\n• Dominant and recessive gene\n• State the two laws of Mendel\n• State the three Mendelian gene genotypes"
      ]
    }
  },
  {
    slug: "soc-101",
    courseCode: "SOC 101",
    courseTitle: "Introduction to Sociology I",
    date: "2026-04-08",
    time: "12 PM – 2 PM",
    topicsToRead: topicsByCourse["SOC 101"],
    answerReveals: [
      {
        questionNumber: 1,
        question:
          "Outline and explain in detail Comte’s three stages of intellectual development.",
        answer:
          "Comte said human thought passes through three stages: Theological stage — people explain events by supernatural or divine forces. Metaphysical stage — explanations shift from gods to abstract ideas or philosophies. Positive/scientific stage — people rely on observation, evidence, and scientific reasoning."
      },
      {
        questionNumber: 2,
        question: "According to Comte, Sociology consists of two branches. Discuss.",
        answer:
          "The two branches are: Social statics — study of social order, structure, and stability. Social dynamics — study of social change, progress, and development. Social statics explains how society is held together, while social dynamics explains how society changes over time."
      },
      {
        questionNumber: "3(a)",
        question: "Define Sociology.",
        answer:
          "Sociology is the scientific study of society, social relationships, institutions, and human social behaviour."
      },
      {
        questionNumber: "3(b)",
        question:
          "Historically, the events that led to the development of sociology may be classified into three parts. Amplify.",
        answer:
          "They include: The Industrial Revolution — changed work, family life, and urban living. The French Revolution — challenged old political and social systems. The growth of scientific thinking/Enlightenment — encouraged the use of reason and evidence in understanding society."
      },
      {
        questionNumber: 4,
        question:
          "Explain the relationship between sociology and the following: Economics (b) Political Science (c) History",
        answer:
          "Economics studies production, distribution, and consumption, while sociology studies how economic life affects people and institutions. Political Science studies government and power, while sociology examines how power and institutions affect society. History studies past events, while sociology helps explain patterns and social forces behind those events."
      },
      {
        questionNumber: "5(a)",
        question: "What is culture?",
        answer:
          "Culture is the total way of life of a people, including their beliefs, values, customs, language, norms, and material objects."
      },
      {
        questionNumber: "5(b)",
        question: "Discuss any three types of culture known to you.",
        answer:
          "Material culture — physical objects like tools, clothes, buildings. Non-material culture — values, beliefs, norms, and language. Ideal culture — what people claim to value or practice; real culture is what they actually do."
      },
      {
        questionNumber: "6(a)",
        question: "Define Social Control.",
        answer:
          "Social control refers to the ways society regulates behaviour and ensures conformity to norms and values."
      },
      {
        questionNumber: "6(b)",
        question: "Mention and explain the five functions of social control.",
        answer:
          "Maintains order — keeps society stable. Promotes conformity — encourages obedience to norms. Prevents deviance — discourages harmful behaviour. Protects values — preserves culture and morality. Ensures social integration — helps members live together peacefully."
      }
    ],
    topicKeyPoints: [
      {
        topic: "DEFINITION OF SOCIOLOGY",
        points: [
          "Sociology studies society scientifically.",
          "It focuses on institutions, relationships, and behaviour."
        ]
      },
      {
        topic: "RELATIONSHIP BETWEEN SOCIOLOGY AND OTHER SOCIAL SCIENCES",
        points: [
          "Linked with economics, political science, anthropology, psychology, history."
        ]
      },
      {
        topic: "THE SCIENTIFIC NATURE OF SOCIOLOGY",
        points: ["Uses observation, evidence, objectivity, and research methods."]
      },
      {
        topic: "METHOD OF SOCIAL RESEARCH",
        points: ["observation", "interview", "questionnaire", "survey", "experiment", "case study"]
      },
      {
        topic: "AIMS  AND SCOPE OF SOCIAL RESEARCH",
        points: [
          "understand society",
          "solve social problems",
          "explain behaviour",
          "guide planning and policy"
        ]
      }
    ],
    pastQuestions: {
      instruction: "Instruction: Answer only 4 questions",
      items: [
        "1. Outline and explain in detail Comte’s three stages of intellectual development.",
        "2. According to Comte, Sociology consists of two branches. Discuss.",
        "3. (a) Define Sociology.\n(b) Historically, the events that led to the development of sociology may be classified into three parts. Amplify.",
        "4. Explain the relationship between sociology and the following:\n(a) Economics\n(b) Political Science\n(c) History",
        "5. (a) What is culture?\n(b) Discuss any three types of culture known to you.",
        "6. (a) Define Social Control.\n(b) Mention and explain the five functions of social control."
      ]
    }
  },
  {
    slug: "psy-105",
    courseCode: "PSY 105",
    courseTitle: "Ethics in Psychology",
    date: "2026-04-08",
    time: "3 PM – 6 PM",
    topicsToRead: topicsByCourse["PSY 105"],
    answerReveals: [
      {
        questionNumber: "1(A)",
        question: "Define ethics and morality, highlighting three key distinctions.",
        answer:
          "Ethics refers to formal principles and standards that guide professional conduct. Morality refers to personal beliefs about right and wrong. Three distinctions: Ethics is professional and formal, morality is personal and informal. Ethics is often written in codes, morality is shaped by upbringing, religion, and culture. Ethics applies to professional duties, morality applies to everyday individual conduct."
      },
      {
        questionNumber: "1(B)",
        question:
          "Explain four ethical principles involved in the treatment of non-human subjects in psychological research.",
        answer:
          "Humane treatment — animals should not be subjected to unnecessary pain. Minimization of harm — researchers should reduce suffering as much as possible. Proper care and housing — animals must be adequately fed and protected. Scientific justification — animal use must be necessary and not done carelessly."
      },
      {
        questionNumber: "2(A)",
        question:
          "List and explain three reasons why ethics is essential in psychological practice.",
        answer:
          "Protects clients and participants from harm. Maintains professional standards and trust. Guides psychologists in difficult decisions and responsible conduct."
      },
      {
        questionNumber: "2(B)",
        question:
          "Identify and describe three consequences of unethical conduct in psychology.",
        answer:
          "Loss of trust and credibility. Harm to clients, participants, or the public. Professional sanctions such as suspension, dismissal, or legal action."
      },
      {
        questionNumber: "3(A)",
        question:
          "Briefly discuss how a Nigerian psychologist should handle a client who confesses intent to harm another.",
        answer:
          "The psychologist should assess the seriousness of the threat, maintain professionalism, take steps to protect the potential victim, and break confidentiality if necessary to prevent harm, in line with ethical and legal obligations."
      },
      {
        questionNumber: "3(B)",
        question: "Outline three consequences of violating professional boundaries.",
        answer:
          "Loss of objectivity. Emotional or psychological harm to the client. Disciplinary action against the psychologist."
      },
      {
        questionNumber: "4(A)",
        question:
          "Identify and explain three unethical research practices and their consequences using Nigerian research contexts.",
        answer:
          "Fabrication or falsification of data — produces false findings and damages trust. Lack of informed consent — violates participant rights. Plagiarism — steals intellectual work and harms professional integrity."
      },
      {
        questionNumber: "4(B)",
        question:
          "Briefly discuss three ways professionals in Nigeria can demonstrate integrity in ethical dilemmas.",
        answer:
          "Honesty in decision-making and reporting. Respect for professional codes and standards. Consultation and accountability when faced with difficult choices."
      },
      {
        questionNumber: 5,
        question:
          "What ethical codes are violated when a psychologist discloses client information to a friend?",
        answer:
          "The psychologist violates confidentiality, privacy, trust, professional responsibility, and respect for client dignity."
      },
      {
        questionNumber: "6(A)",
        question: "Explain two challenges psychologists face in maintaining boundaries with clients.",
        answer:
          "Dual relationships — when personal and professional roles overlap. Emotional attachment or over-involvement — which can affect judgment and objectivity."
      },
      {
        questionNumber: "6(B)",
        question:
          "Briefly explain one importance of whistleblowing policy in Nigerian psychological practice.",
        answer:
          "A whistleblowing policy is important because it helps expose unethical conduct, protects clients and institutions, and promotes accountability in professional practice."
      }
    ],
    topicKeyPoints: [
      {
        topic: "UNDERSTANDING THE HUMAN MIND AND BEHAVIOR: THE PHILOSOPHICAL PERSPECTIVE",
        points: [
          "Human behaviour can be examined through reason, values, and reflection.",
          "Philosophy laid the foundation for psychology."
        ]
      },
      {
        topic: "ETHICS - INTRODUCTION TO ETHICS IN PSYCHOLOGY",
        points: [
          "Ethics guides professional behaviour.",
          "It protects clients, participants, and the integrity of the profession."
        ]
      },
      {
        topic: "ETHICAL THEORIES",
        points: ["Utilitarianism", "Deontology", "Virtue ethics"]
      },
      {
        topic: "ETHICS IN SCIENTIFIC RESEARCH",
        points: [
          "informed consent",
          "confidentiality",
          "protection from harm",
          "honesty in reporting"
        ]
      },
      {
        topic: "REDRESSING UNETHICAL BEHAVIOR",
        points: ["reporting misconduct", "sanctions", "review boards", "accountability systems"]
      },
      {
        topic: "LOBBYING IN PROMOTING PSYCHOLOGY IN PUBLIC SPACE",
        points: [
          "creating awareness",
          "advocating for mental health",
          "promoting psychology in policy and society"
        ]
      },
      {
        topic: "INTEGRITY IN PSYCHOLOGICAL PRACTICE",
        points: ["honesty", "responsibility", "confidentiality", "fairness"]
      },
      {
        topic: "EMOTIONAL INTELLIGENCE",
        points: ["ability to understand and manage emotions in self and others"]
      },
      {
        topic: "INATTENTIONAL BLINDNESS OR INATTENTIONAL AMNESIA",
        points: ["failure to notice or retain information because attention was elsewhere"]
      },
      {
        topic: "UNDERSTANDING HUMAN MEMORY",
        points: ["encoding", "storage", "retrieval", "forgetting"]
      }
    ],
    pastQuestions: {
      instruction: "Instruction: Answer any 4 questions",
      items: [
        "1. (A) Define ethics and morality, highlighting three key distinctions.\n(B) Explain four ethical principles involved in the treatment of non-human subjects in psychological research.",
        "2. (A) List and explain three reasons why ethics is essential in psychological practice.\n(B) Identify and describe three consequences of unethical conduct in psychology.",
        "3. (A) Briefly discuss how a Nigerian psychologist should handle a client who confesses intent to harm another.\n(B) Outline three consequences of violating professional boundaries.",
        "4. (A) Identify and explain three unethical research practices and their consequences using Nigerian research contexts.\n(B) Briefly discuss three ways professionals in Nigeria can demonstrate integrity in ethical dilemmas.",
        "5. What ethical codes are violated when a psychologist discloses client information to a friend?",
        "6. (A) Explain two challenges psychologists face in maintaining boundaries with clients.\n(B) Briefly explain one importance of whistleblowing policy in Nigerian psychological practice."
      ]
    }
  },
  {
    slug: "gst-111",
    courseCode: "GST 111",
    courseTitle: "GST",
    date: "2026-04-13",
    time: "12 PM – 2 PM",
    topicsToRead: topicsByCourse["GST 111"],
    pastQuestions: null
  },
  {
    slug: "igb-107",
    courseCode: "IGB 107",
    courseTitle: "Basic Igbo",
    date: "2026-04-14",
    time: "Time not specified",
    topicsToRead: topicsByCourse["IGB 107"],
    pastQuestions: null
  }
];

export const levelOptions = [
  {
    key: "100-level",
    label: "100 LEVEL",
    level: "100 Level"
  },
  {
    key: "200-level",
    label: "200 LEVEL",
    level: "200 Level"
  }
] as const;

export type LevelKey = (typeof levelOptions)[number]["key"];

export const defaultLevelKey: LevelKey = "100-level";

const archivedFirstSemesterRecords: ExamRecord[] = archivedFirstSemesterSource.map((exam) => ({
  ...exam,
  session: "2025/2026",
  semester: "First Semester",
  level: "100 Level",
  status: "archived",
  examVenue: null
}));

const secondSemesterTopicsByCourse: Record<string, string[]> = {
  "CSD 102": [
    "1. Foundation and Origin of Career Services",
    "2. Self-Confidence and Career Development",
    "3. Independence and Responsibility: Lessons for Freshers",
    "4. Early Career Planning",
    "5. Time Management and Productivity: A Student's Perspective",
    "6. Personal Branding and Self-Assessment",
    "7. Interest Inventory",
    "8. Career Assessment and Administration",
    "9. Cultural Factors Influencing Career Choices in Nigeria",
    "10. Professional Ethics in Career Development",
    "11. Leadership and Mentorship Skills for Students",
    "12. Technical and Computer Skills for Career Success",
    "13. Decision Making for Freshers"
  ],
  "PSY 104": [
    `Module 1: Introduction to Statistics

• Meaning and Nature of Statistics
• Sources of Statistical Data in Nigeria
• Role of Statistics
• Uses and Limitations of Statistics
• Population and Sample
• Surveys and Experiments`,
    `Module 2: Descriptive Statistics

• Frequency Distribution
• Mean
• Median
• Mode
• Range
• Summarizing Characteristics of Populations and Samples`,
    `Module 3: Measures of Central Tendency and Variability

• Computing and Interpreting Measures of Central Tendency
• Variance
• Standard Deviation`,
    `Module 4: Levels of Measurement

• Nominal Scale
• Ordinal Scale
• Interval Scale
• Ratio Scale
• Selecting Appropriate Statistics for Each Level`,
    `Module 5: Inferential Statistics

• Estimation from Samples
• Statistical Parameters
• Population Inference`,
    `Module 6: Hypothesis Testing

• Null Hypothesis
• Alternative Hypothesis
• Parametric Tests
• Non-Parametric Tests`,
    `Module 7: Tests of Association

• Chi-Square Test
• Tests for Nominal and Ordinal Data
• Measures of Association`,
    `Module 8: Correlation Analysis

• Pearson Product-Moment Correlation
• Spearman Rank-Order Correlation`,
    `Module 9: Analysis of Variance

• One-Way ANOVA
• Introduction to Factor Analysis`
  ],
  "HIS 104": [
    "1. History of Science: An Overview",
    "2. Philosophy of Science: An Overview",
    "3. Scientific Methodology",
    "4. Man as the Centre of Science: His Origin",
    "5. Origin of Life: A Biochemical Perspective",
    "6. Continuity of Life",
    "7. Science in the Service of Man",
    "8. Man and His Cosmic Environment",
    "9. Implications of Technological Advances on Human Welfare",
    "10. Biodiversity and the Impact of Deforestation in Nigeria",
    "11. Impact of Oil Exploration in Nigeria"
  ],
  "PSY 118": [
    "1. Approaches to the Formation of Political Beliefs",
    "2. Political Attitudes and Behaviour",
    "3. Theories of Political Attitudes",
    "4. Social Perception in Politics",
    "5. Political Personality",
    "6. Political Alienation and Anomia",
    "7. Political Leadership and Authoritarianism",
    "8. Political Conflict, Aggression, Violence, Revolution and War",
    "9. Elections and Electoral Practices",
    "10. African Regional Politics and International Relations"
  ],
  "PSY 122": [
    "1. Meaning of Determinants of Behaviour",
    "2. Physical, Social, Environmental, Cultural and Biological Determinants of Behaviour",
    "3. Biological Basis of Behaviour",
    "4. Neurons, Brain and the Endocrine System",
    "5. Behaviour",
    "6. Intelligence",
    "7. Perception",
    "8. Emotion"
  ],
  "ELS 102": [
    "1. Developing Effective Writing Skills",
    "2. Grammar, Word Classes, Concord and Punctuation",
    "3. Sentence Construction Techniques",
    "4. Paragraph Development",
    "5. Essay Writing Techniques",
    "6. Academic Writing",
    "7. Creative Writing",
    "8. Professional and Technical Writing",
    "9. Writing Style and Language Use",
    "10. Editing and Proofreading",
    "11. Writing for Digital and Media Platforms",
    "12. Advanced Writing Strategies",
    "13. Writing Practice and Skill Development",
    "14. Common Writing Problems and Their Solutions",
    "15. Writing Effective Conclusions",
    "16. Poetry Writing in Modern Times",
    "17. Curriculum Vitae (CV) and Résumé Writing",
    "18. Writing for Specific Purposes"
  ],
  "IGBO 107": [
    "1. Ndubata (Introduction)",
    "2. Edemede – Akụkọ",
    "3. Atụmatụ Okwu (Figures of Speech)",
    "4. Agụmagụ (Literature)",
    "5. Ntughari na Ọkwọwaokwu (Translation and Dictionary)",
    "6. Edemede Okwu Nka na Okwu Ọhụrụ",
    "7. Edemede Omụma Igbo",
    "8. Okwu Nọha"
  ],
  "PSY 116": [
    "1. Understanding the Concept of Psychology",
    "2. Philosophical Influences on Psychology",
    "3. Physiological Influences on Psychology",
    "4. Beginning of Experimental Psychology",
    "5. Contributions of Women to Modern Psychology",
    "6. Structuralism and Functionalism",
    "7. Psychoanalysis and Behaviourism",
    "8. Cognitivism, Humanism and Gestalt Psychology",
    "9. Major Theories of Psychology",
    "10. Ethical Issues in the Practice of Psychology",
    "11. African Philosophy and Psychology",
    "12. Psychology and Religion",
    "13. Professional Bodies of Psychologists in Nigeria",
    "14. Challenges Facing the Practice of Psychology in Nigeria"
  ],
  "NPC 112": [
    "1. Exploring Nigeria's Past: Ethnic Groups",
    "2. Impact and Legacy of Colonialism in Nigeria",
    "3. The Making of Modern Nigeria",
    "4. Nigeria After Independence: Challenges of Nation Building",
    "5. Economic Independence and Self-Sufficiency",
    "6. Nigeria's Contemporary Landscape",
    "7. Social Justice in Nigeria",
    "8. Citizenship: Rights, Responsibilities and Duties",
    "9. Human Rights in Nigeria",
    "10. Nigerian Culture: Core Norms and Values",
    "11. Nigeria's Future: Moral Reorientation"
  ],
  "PSY 102": [
    `Module 1: Introduction

• Scope of Military Psychology
• Nature of Military Operations
• Current Contributions of Psychology to Military Operations`,
    `Module 2: Leadership and Military Indoctrination

• Military Leadership Philosophy
• Obedience and Compliance
• Principles of Military Obedience
• Theories of Military Leadership
• Personality of Military Leaders
• Military Indoctrination
• Stages of Indoctrination
• Mechanisms of Indoctrination`,
    `Module 3: Personnel Selection

• Selection Techniques
• Selection Process
• Personnel Selection Tools`,
    `Module 4: Combat Stress and PTSD

• Types of Combat Stress
• Sources of Stress
• Symptoms of Military Stress
• Protective Factors
• PTSD
• Symptoms and Diagnosis
• Treatment`,
    `Module 5: Drug Use in the Military

• Common Drugs
• Causes of Drug Use
• Treatment Principles
• Treatment Approaches
• Withdrawal Syndrome`,
    `Module 6: Attention and Vigilance

• Sustained Attention
• Neurophysiology of Attention
• Inattention
• Functions of Attention
• Vigilance
• Principles of Vigilance Behaviour
• Psychological Variables Influencing Vigilance
• Measurement of Vigilance
• Psychological Resilience`,
    `Module 7: Psychological Assessment

• Military Selection Process
• Psychological Assessment Tools
• Placement, Training and Promotion
• Applications of Psychological Testing
• Challenges of Military Assessment`,
    `Module 8: Military Intelligence

• Characteristics of Military Intelligence
• Benefits of Military Intelligence
• Types of Intelligence
• Intelligence Process
• Levels of Intelligence
• Intelligence Analysis
• Knowledge Required for Intelligence Analysis`,
    `Module 9: Crime Investigation

• Traits of an Investigator
• Principles of Crime Investigation
• Military Investigation Process
• Behavioural Traits in Investigation Management
• Steps in Crime Prosecution
• Investigative Interviewing
• Leading Interview Questions`,
    `Module 10: Insurgency and Terrorism

• Terrorism
• Causes of Insurgency and Terrorism
• Strategies for Prevention and Control`
  ],
  "ICT 102": [
    `Theory

1. Introduction`,
    "2. Computer Hardware",
    "3. Computer Software and Operating Systems",
    "4. Computer Viruses",
    "5. Meaning and Origin of Libraries",
    "6. Types of Libraries",
    "7. Library Resources and Services",
    "8. Library Rules and Regulations",
    `Practical

1. Introduction to Computer Technology`,
    "2. Types of Computers",
    "3. Operating System Applications",
    "4. Windows Operating System",
    "5. Networking",
    "6. Application Software",
    "7. Career Opportunities in ICT",
    "8. Computer Education"
  ]
};

const secondSemesterPastQuestionsByCourse: Record<
  string,
  NonNullable<ExamRecord["pastQuestions"]>
> = {
  "PSY 102": {
    instruction:
      "2024/2025 Second Semester Examination\n\nInstruction: Answer any four (4) questions",
    items: [
      "1. Discuss five (5) values of police and military leadership.",
      "2. Explain three (3) basic attributes of police and military leaders.",
      "3. Explain four (4) effects of drug use and abuse in police and military.",
      "4. Discuss four (4) principles of vigilance behaviour in police and military.",
      "5. List and explain four (4) coping methods in treating withdrawal syndrome.",
      "6. Discuss four (4) principles of criminal investigation."
    ]
  },
  "PSY 116": {
    instruction:
      "2024/2025 Second Semester Examination\n\nInstruction: Answer Question 1 and any other three questions.",
    items: [
      "1. With three (3) points, explain why it is important for a trainee Psychologist to study the History and Systems of Psychology.",
      "2. Discuss extensively three (3) major contributions of Wilhelm Wundt to the development of Modern Psychology.",
      "3. Scientific study of Psychology emerged as a discipline from Philosophy and Physiology. Discuss in one page at least.",
      "4. Discuss extensively three (3) major contributions of Abraham Maslow to the development of Modern Psychology.",
      "5. Write short notes (at least half a page each) on the following schools of thought in Psychology:\n(a) Functionalism\n(b) Behaviourism",
      "6.\n(a) What do you think are three (3) major challenges facing the practice of Psychology in Nigeria?\n\n(b) What are the possible solutions to the identified challenges?"
    ]
  },
  "PSY 118": {
    instruction:
      "2024/2025 Second Semester Examination\n\nInstruction: Answer four (4) questions only",
    items: [
      "1. Several sources of power in specialized settings have been delineated by scientists. As a psychologist, discuss five sources of power known to you.",
      "2. Enumerate five strategies for pre-election rigging pattern in your country.",
      "3. The formation of relevant political attitudes is often determined by several factors. Discuss.",
      "4. Identify five rationales behind rigging of elections in your country.",
      "5. As a political psychologist cum electoral chair in your country, proffer five (5) viable panaceas to election rigging in your nation.",
      "6. There are basically two dimensions of authority and power in administration and governance. Identify and discuss them.\n\n(b) Discuss the following terms:\n(i) Connection Power\n(ii) Information Power\n(iii) Socialization"
    ]
  },
  "PSY 122": {
    instruction:
      "2024/2025 Second Semester Examination\n\nInstruction: Attempt any four (4) questions.",
    items: [
      "1. Behaviour involves responses to stimuli by an individual, species or group (Eyo, 2003). Discuss.",
      "2. Discuss two (2) methods of studying Human heredity.",
      "3. Learning is normally defined as the process by which relatively permanent changes in behaviour are brought about through experience and practice (Eyo, 2003). Discuss.",
      "4. Discuss two (2) major factors affecting attention in the determinants of behaviour.",
      "5. Explain three (3) socio-cultural environmental factors that can determine pathological behaviours.",
      "6. Write notes on the following:\n(a) Neurosis\n(b) Psychosis\n(c) Depressants\n(d) Stimulants\n(e) Bodily/Physical Health Conditions"
    ]
  },
  "PSY 104": {
    instruction:
      "2024/2025 Second Semester Examination\n\nInstructions:\nAnswer Question 1 and any other three (3) questions.\n\nDo not write anything on the question paper except your matriculation number and name.\n\nAll rough calculations must be done on the back pages of your answer sheets.",
    items: [
      "1.\n(a) What is a variable? (4 marks)\n(b) List three types of variables. (3 marks)\n(c) How can temperature be classified as a variable? (3 marks)\n(d) What is a hypothesis? (5 marks)\n(e) What are the types of hypotheses? (3 marks)\n(f) What is a critical value? (2 marks)\n(g) Differentiate between a monotonic relationship and a linear relationship. (5 marks)",
      "2. Chioma and Ezinne were asked to rank their favourite eateries in Owerri from a list of 10 eateries.\n\nTheir rankings are presented in Table 1 below.\n\nTable 1: Raw Scores of Two Students' Preference of 10 Eateries in Owerri.\n\n(a) Calculate the relationship of their preferences using the Spearman Rank Order Correlation (rₛ). (15 marks)\n\n(b) Briefly explain the result obtained in relation to the data set provided.",
      "3. As a school administrator, you want to find out whether results obtained by 10 students in two class tests are related.\n\nUsing Pearson's r and Table 2 below, calculate the relationship and write a brief report. (15 marks)",
      "4. In a survey conducted in your area, students were asked about their gender and whether they consume alcohol.\n\nThe results are presented in Table 3 below.\n\n(a) Compute the Chi-square test statistic and make a decision at the 0.05 level of significance. (10 marks)\n\n(b) Briefly interpret your result in plain language. (5 marks)",
      "5. A study was conducted to investigate whether sleep improves memory recall.\n\nTen participants were asked to memorize a list of words and recall them immediately after learning (pre-sleep) and again after a full night's sleep (post-sleep).\n\nConduct a related t-test to determine if sleep has a significant effect on memory recall. (15 marks)",
      "6. The Department of Psychology wants to find out whether results obtained from PSY 123 were fair.\n\nThe results show:\n\nA = 3\nB = 7\nC = 20\nD = 20\nE = 23\nF = 37\n\nAs a research assistant in the department, using the Chi-square Goodness of Fit:\n\n(a) Determine how many students wrote the examination.\n\n(b) Determine whether the results were fair.\n\nShow all calculations. (15 marks)"
    ]
  }
};

const psy104SupportingData: QuestionSupportingData[] = [
  {
    questionNumber: 2,
    kind: "practice_supporting_data",
    title: "Raw Scores of Two Students' Preference of 10 Eateries in Owerri",
    columns: ["Eateries Name", "Chioma (X)", "Ezinne (Y)"],
    rows: [
      ["A", "4", "3"],
      ["B", "5", "4"],
      ["C", "6", "5"],
      ["D", "1", "2"],
      ["E", "9", "10"],
      ["F", "8", "7"],
      ["G", "2", "1"],
      ["H", "10", "9"],
      ["I", "7", "8"],
      ["J", "3", "6"]
    ]
  },
  {
    questionNumber: 3,
    kind: "practice_supporting_data",
    title: "Students' Results in Two Class Tests",
    columns: ["Student Serial Number", "Test 1", "Test 2"],
    rows: [
      ["1", "8", "10"],
      ["2", "12", "14"],
      ["3", "15", "16"],
      ["4", "18", "20"],
      ["5", "10", "11"],
      ["6", "14", "15"],
      ["7", "16", "18"],
      ["8", "20", "21"],
      ["9", "11", "13"],
      ["10", "17", "19"]
    ]
  },
  {
    questionNumber: 4,
    kind: "practice_supporting_data",
    title: "Gender and Alcohol Consumption",
    columns: ["Gender", "Consume Alcohol", "Do Not Consume Alcohol", "Total"],
    rows: [
      ["Male", "18", "12", "30"],
      ["Female", "10", "20", "30"],
      ["Total", "28", "32", "60"]
    ]
  },
  {
    questionNumber: 5,
    kind: "practice_supporting_data",
    title: "Memory Recall Scores Before and After Sleep",
    columns: ["Participant", "Pre-Sleep", "Post-Sleep"],
    rows: [
      ["1", "11", "16"],
      ["2", "9", "14"],
      ["3", "13", "18"],
      ["4", "10", "15"],
      ["5", "12", "17"],
      ["6", "8", "12"],
      ["7", "14", "19"],
      ["8", "7", "12"],
      ["9", "11", "14"],
      ["10", "9", "16"]
    ]
  }
];

const psy104Question6SupportingDataReviewBackup: QuestionSupportingData = {
  questionNumber: 6,
  kind: "practice_supporting_data",
  title: "Chi-square Goodness of Fit Expected Frequencies",
  columns: ["Grade", "Observed Frequency", "Expected Frequency"],
  rows: [
    ["A", "3", "15"],
    ["B", "7", "15"],
    ["C", "20", "15"],
    ["D", "20", "15"],
    ["E", "23", "15"],
    ["F", "37", "15"]
  ]
};

const secondSemester200LevelTopicsByCourse: Record<string, string[]> = {
  "PSY 202": [
    "The Concept of Evolution",
    "Theories of Evolution",
    "Modern Theories of Evolution",
    "Genetics Basics of Human Behaviour",
    "Heredity and Mendel's Law of Heredity",
    "Chromosomes, Genes and DNA",
    "Genotype and Phenotype",
    "Relative Contribution of Genetics/Nature",
    "Environmental Factors (Nurture) in Human Behaviour",
    "Application of Genetics to Human Behaviour",
    "Sex Chromosomes and Genetic Abnormalities",
    "Internal Environment and Homeostasis",
    "Endocrine System"
  ],
  "PSY 204": [],
  "PSY 206": [],
  "PSY 208": [
    "Introduction",
    "Definition and Importance of Studying Positive Psychology",
    "Goals of Positive Psychology",
    "Origin of Positive Psychology",
    "Theories of Positive Psychology",
    "Key Concepts:\n• Well-being\n• Flow\n• Gratitude\n• Happiness",
    "Positive Emotions",
    "Positive Relationships",
    "Self Presentation",
    "Self-esteem and Personal Growth"
  ],
  "PSY 210": [
    "Foundations of Consumer Psychology",
    "Research Methods in Consumer Psychology",
    "Learning, Memory and Information Processing in Consumer Behaviour",
    "Sensation and Perception",
    "Personality Traits and Individual Differences",
    "Motivation, Needs and Consumer Drives",
    "Consumer Decision Making"
  ],
  "PSY 212": [
    "Introduction",
    "Definition and Scope of Counselling Psychology",
    "Benefits of Counselling",
    "Historical Development of Counselling Psychology",
    "Difference Between Counselling Psychology and Other Related Fields",
    "Roles and Settings of Counselling Psychologists",
    "Counselling Skills and Practice",
    "Assessment in Counselling",
    "Characteristics of a Good Counsellor",
    "Self Care for Counsellors",
    "Ethical Principles in Counselling"
  ],
  "PSY 214": [],
  "GST 212": [
    "Philosophy: Notions, Branches and Problems",
    "Philosophy and the Quest for Knowledge",
    "Logic: The Indispensable Tool of Philosophy",
    "Arguments: Nature, Forms and Elements",
    "Laws of Thought and Fallacies",
    "Logic of Form and Logic of Content",
    "Critical and Creative Thinking",
    "Philosophy and Human Existence",
    "Philosophy, Politics and Religion",
    "Philosophy, Character and Human Values"
  ],
  "SSC 202": []
};

const psy204Question4ReviewBackup =
  "4. (a) What is genetic?\n(b) Specify and explain at least two factors that could be responsible for human genetic variability.\n(c) Vividly distinguish positive feedback mechanism from negative feedback mechanism.";

const psy204OriginalQuestion5ReviewBackup =
  "5. (a) Identify the roles and goals of any three agents of socialization.\n(b) Based on the DSM-IV manual, present four factors that could lead to addiction at the workshop list.";

const psy208PastQuestionsReviewBackup: NonNullable<ExamRecord["pastQuestions"]> = {
  instruction: "Course Examination Questions",
  items: [
    "1. Explain the three (3) major classifications of adulthood with their associated developmental tasks.",
    "2. What are the five (5) major biological changes associated with middle adulthood?",
    "3. Peck (1955) expanded Erikson's concepts by suggesting that there are four psychological advances critical to successful adjustment in middle adulthood. Discuss.",
    "4. Discuss three (3) theories of successful aging.",
    "5. Explain four (4) research methods employed in the study of adult development.",
    "6. Erikson's (1963) seventh life stage developmental crisis is Generativity versus stagnation. Discuss."
  ]
};

const psy216PastQuestionsReviewBackup: NonNullable<ExamRecord["pastQuestions"]> = {
  instruction: "Instruction: Answer any four questions.",
  items: [
    "1. The glands which constitute the endocrine system are of great interest to psychologists.\n(a) Vividly explain the endocrine system.\n(b) State any two glands of your choice and the essence of the hormone.",
    "2.\n(a) Define homeostasis.\n(b) State at least three organs of the body that are involved in homeostasis.\n(c) Identify and explain at least two ways through which a particular organ is involved in homeostasis.",
    "3.\n(a) What is genetics?\n(b) Specify and explain at least two factors that could be responsible for human genetic variability.\n(c) Vividly distinguish positive feedback mechanism from negative feedback mechanism.",
    "4. According to the theory of evolution by Charles Darwin, natural selection depends on four specific processes. Identify and explain any three of these processes.",
    "5.\n(a) Explain biological basis.\n(b) Explain structural relationship between:\n(i) Cells\n(ii) Deoxyribonucleic Acid (DNA)\n(iii) Chromosomes",
    "6. Explain four psychological variables that influence consumer behaviour."
  ]
};

const secondSemester200LevelPastQuestionsByCourse: Record<
  string,
  NonNullable<ExamRecord["pastQuestions"]>
> = {
  "PSY 204": {
    instruction:
      "Second Semester Examination 2024/2025 Academic Session\n\nInstruction: Answer any four (4) questions.",
    items: [
      "1. Social psychology is the study of social interaction. With 3 different examples, explain this to your friend, mother and rival.\n\nB) Define attitude according to Morgan et al. (1976).",
      "2. With 3 good points differentiate social psychology from clinical psychology.\n\nB) State ten (10) relevance of social psychology.",
      "3. In a tabular format list 7 theories of social psychology with the author(s) year and illustrate them briefly.",
      "5. (a) Identify the roles and goals of any three agents of socialization.",
      "6. Discuss the social influences in attitude formation.\n\nB) List any 8 agents of socialization.",
      "7. In 200 words discuss the statement:\n\"Quitting smoking is a manifestation of attitude.\"",
      "8. List 10 characteristics of attitude."
    ]
  },
  "PSY 206": {
    instruction:
      "Second Semester Examination 2024/2025 Academic Session\n\nInstructions: Attempt any four (4) questions.",
    items: [
      "1. Explain the three (3) major classifications of adulthood with their associated developmental tasks.",
      "2. Vividly explain five (5) major biological changes associated with middle adulthood.",
      "3. Peck (1955) expanded Erikson's concepts by suggesting that there are four psychological advances critical to successful adjustment in middle adulthood. Discuss.",
      "4. Discuss three (3) theories of successful aging.",
      "5. Explain four (4) research methods employed in the study of adult development.",
      "6. Erikson's (1963) seventh life stage developmental crisis is Generativity versus stagnation. Discuss."
    ]
  },
  "PSY 210": {
    instruction: "Instruction: Answer any four questions.",
    items: [
      "1. Define consumer behaviour and explain the domains of consumer behaviour with suitable examples.",
      "2. Explain the four primary types of decisions that consumers make before purchase.",
      "3. Discuss the applications of the three learning theories in consumer psychology.",
      "4. List the seven keys of consumer behaviour and explain any four.",
      "5. Discuss with examples four external factors that influence consumer behaviour.",
      "6. Explain four psychological variables that influence consumer behaviour."
    ]
  },
  "PSY 212": {
    instruction: "Instruction: Answer question 1 and any other three questions.",
    items: [
      "1.\n(a) What do you understand by Counselling?\n(b) List and discuss any three (3) scope of Counselling Psychology.",
      "2. With at least three (3) points, explain the benefits of Counselling to individuals.",
      "3. Examine any three (3) skills a good Counsellor must apply in Counselling Practice.",
      "4. In not more than one and half pages, critically evaluate any theory of Counselling Psychology of your interest.",
      "5. List and explain at least five (5) characteristics of a good Counsellor.",
      "6. In not more than one and half pages, trace the history of Counselling Psychology."
    ]
  }
};

const psy216RemovedCourseRecord: ExamRecord = {
  slug: "psy-216",
  courseCode: "PSY 216",
  courseTitle: "Sensory Processes",
  session: "2025/2026",
  semester: "Second Semester",
  level: "200 Level",
  status: "current",
  date: null,
  time: null,
  examVenue: null,
  topicsToRead: [],
  pastQuestions: null
};

// Non-rendered backups preserve questionable source content until ownership is verified.
export const academicContentReviewBackups = {
  removedCourseRecords: {
    "PSY 216": {
      reason:
        "Confirmed as not offered during the 2025/2026 Second Semester academic period.",
      courseRecord: psy216RemovedCourseRecord,
      reviewOnlyPastQuestions: psy216PastQuestionsReviewBackup
    }
  },
  removedFromActivePastQuestions: {
    "PSY 204": {
      reason:
        "Question 4 appears unrelated to Social Psychology, and the original Question 5 contains an incomplete part (b). Question 5(a) remains active unchanged.",
      questions: [
        {
          questionNumber: "4",
          text: psy204Question4ReviewBackup
        },
        {
          questionNumber: "5",
          text: psy204OriginalQuestion5ReviewBackup
        }
      ]
    },
    "PSY 208": {
      reason:
        "The supplied questions focus on adulthood and aging and overlap with PSY 206. Ownership is awaiting verification.",
      pastQuestions: psy208PastQuestionsReviewBackup
    }
  },
  removedFromActiveSupportingData: {
    "PSY 104": {
      reason:
        "Question 6 observed and expected frequency totals are inconsistent. No replacement values have been created.",
      supportingData: [psy104Question6SupportingDataReviewBackup]
    }
  },
  canonicalQuestionSources: {
    "PSY 115": {
      source: "pastQuestions.items",
      answerRelationship: "answerReveals contains one answer-linked record per source question"
    },
    "PSY 123": {
      source: "pastQuestions.items",
      answerRelationship:
        "answerReveals contains answer-linked subquestions grouped by the leading question number"
    },
    "PSY 117": {
      source: "pastQuestions.items",
      answerRelationship:
        "answerReveals contains answer-linked subquestions grouped by the leading question number"
    },
    "BIO 101": {
      source: "pastQuestions.items",
      answerRelationship:
        "answerReveals contains answer-linked subquestions grouped by the leading question number"
    },
    "SOC 101": {
      source: "pastQuestions.items",
      answerRelationship:
        "answerReveals contains answer-linked questions and subquestions grouped by the leading question number"
    },
    "PSY 105": {
      source: "pastQuestions.items",
      answerRelationship:
        "answerReveals contains answer-linked questions and subquestions grouped by the leading question number"
    }
  }
} as const;

const currentSecondSemesterRecords: ExamRecord[] = [
  {
    slug: "psy-116",
    courseCode: "PSY 116",
    courseTitle: "History and Systems of Psychology",
    session: "2025/2026",
    semester: "Second Semester",
    level: "100 Level",
    status: "confirmed",
    date: "2026-08-12",
    time: "3 PM – 6 PM",
    examVenue: "CSS Block",
    topicsToRead: secondSemesterTopicsByCourse["PSY 116"],
    pastQuestions: secondSemesterPastQuestionsByCourse["PSY 116"]
  },
  {
    slug: "psy-122",
    courseCode: "PSY 122",
    courseTitle: "Determinants of Behaviour",
    session: "2025/2026",
    semester: "Second Semester",
    level: "100 Level",
    status: "confirmed",
    date: "2026-08-17",
    time: "3 PM – 6 PM",
    examVenue: "CSS Block",
    topicsToRead: secondSemesterTopicsByCourse["PSY 122"],
    pastQuestions: secondSemesterPastQuestionsByCourse["PSY 122"]
  },
  {
    slug: "psy-104",
    courseCode: "PSY 104",
    courseTitle: "Quantitative Method in Psychology",
    session: "2025/2026",
    semester: "Second Semester",
    level: "100 Level",
    status: "confirmed",
    date: "2026-08-27",
    time: "3 PM – 6 PM",
    examVenue: "Eco Block",
    topicsToRead: secondSemesterTopicsByCourse["PSY 104"],
    pastQuestions: secondSemesterPastQuestionsByCourse["PSY 104"],
    supportingData: psy104SupportingData
  },
  {
    slug: "psy-102",
    courseCode: "PSY 102",
    courseTitle: "Police or Military Psychology",
    session: "2025/2026",
    semester: "Second Semester",
    level: "100 Level",
    status: "confirmed",
    date: "2026-09-01",
    time: "12 Noon – 2 PM",
    examVenue: "Eco Block, NF Rooms 24, 23, 22, 15, 7, SF Room 26",
    topicsToRead: secondSemesterTopicsByCourse["PSY 102"],
    pastQuestions: secondSemesterPastQuestionsByCourse["PSY 102"]
  },
  {
    slug: "psy-118",
    courseCode: "PSY 118",
    courseTitle: "Political Psychology",
    session: "2025/2026",
    semester: "Second Semester",
    level: "100 Level",
    status: "confirmed",
    date: "2026-08-24",
    time: "3 PM – 6 PM",
    examVenue: "NF Rooms 22, 23 & 15",
    note: "The course code mapping requires confirmation.",
    topicsToRead: secondSemesterTopicsByCourse["PSY 118"],
    pastQuestions: secondSemesterPastQuestionsByCourse["PSY 118"]
  },
  {
    slug: "cds-102",
    courseCode: "CSD 102",
    courseTitle: "Career Development Services",
    session: "2025/2026",
    semester: "Second Semester",
    level: "100 Level",
    status: "confirmed_schedule_code_pending",
    date: "2026-09-14",
    additionalExamDates: ["2026-09-15"],
    time: "8 AM",
    examVenue: null,
    note: "Course materials use CDS 102. Official CBT timetable lists CSD 102.",
    topicsToRead: secondSemesterTopicsByCourse["CSD 102"],
    pastQuestions: null
  },
  {
    slug: "gst-104",
    courseCode: "HIS 104",
    courseTitle: "History and Philosophy of Science",
    session: "2025/2026",
    semester: "Second Semester",
    level: "100 Level",
    status: "confirmed_schedule_code_pending",
    date: "2026-09-18",
    additionalExamDates: ["2026-09-19"],
    time: "8 AM",
    examVenue: null,
    note: "Course materials use GST 104. Official CBT timetable lists HIS 104.",
    topicsToRead: secondSemesterTopicsByCourse["HIS 104"],
    pastQuestions: null
  },
  {
    slug: "els-112",
    courseCode: "ELS 102",
    courseTitle: "English Language Writing Skills",
    session: "2025/2026",
    semester: "Second Semester",
    level: "100 Level",
    status: "confirmed_schedule_code_pending",
    date: "2026-09-12",
    time: "8 AM",
    examVenue: null,
    note: "Course materials use ELS 112. Official CBT timetable lists ELS 102.",
    topicsToRead: secondSemesterTopicsByCourse["ELS 102"],
    pastQuestions: null
  },
  {
    slug: "sgb-118",
    courseCode: "IGBO 107",
    courseTitle: "Igbo",
    session: "2025/2026",
    semester: "Second Semester",
    level: "100 Level",
    status: "confirmed_schedule_code_pending",
    date: "2026-09-16",
    additionalExamDates: ["2026-09-17"],
    time: "8 AM",
    examVenue: null,
    note: "Course materials use SGB 118. Official CBT timetable lists IGBO 107.",
    topicsToRead: secondSemesterTopicsByCourse["IGBO 107"],
    pastQuestions: null
  },
  {
    slug: "npc-112",
    courseCode: "NPC 112",
    courseTitle: "Nigerian People and Culture",
    session: "2025/2026",
    semester: "Second Semester",
    level: "100 Level",
    status: "confirmed_schedule_code_pending",
    date: "2026-09-10",
    time: "8 AM",
    examVenue: null,
    note: "Course materials use GST 112. Official CBT timetable lists NPC 112.",
    topicsToRead: secondSemesterTopicsByCourse["NPC 112"],
    pastQuestions: null
  },
  {
    slug: "ict-100",
    courseCode: "ICT 102",
    courseTitle: "Use of Computer Packages and Library",
    session: "2025/2026",
    semester: "Second Semester",
    level: "100 Level",
    status: "confirmed_schedule_code_pending",
    date: "2026-09-07",
    additionalExamDates: ["2026-09-08"],
    time: "8 AM",
    examVenue: null,
    note: "Course materials use ICT 100. Official CBT timetable lists ICT 102.",
    topicsToRead: secondSemesterTopicsByCourse["ICT 102"],
    pastQuestions: null
  }
];

const currentSecondSemester200LevelRecords: ExamRecord[] = [
  {
    slug: "psy-204",
    courseCode: "PSY 204",
    courseTitle: "Introduction to Social Psychology",
    session: "2025/2026",
    semester: "Second Semester",
    level: "200 Level",
    status: "confirmed",
    date: "2026-08-10",
    time: "3:00 PM - 6:00 PM",
    examVenue: "NF Room 23",
    topicsToRead: secondSemester200LevelTopicsByCourse["PSY 204"],
    pastQuestions: secondSemester200LevelPastQuestionsByCourse["PSY 204"]
  },
  {
    slug: "psy-206",
    courseCode: "PSY 206",
    courseTitle: "Developmental Psychology II (Adulthood and Aging)",
    session: "2025/2026",
    semester: "Second Semester",
    level: "200 Level",
    status: "confirmed",
    date: "2026-08-11",
    time: "3:00 PM - 6:00 PM",
    examVenue: "CSS Block",
    topicsToRead: secondSemester200LevelTopicsByCourse["PSY 206"],
    pastQuestions: secondSemester200LevelPastQuestionsByCourse["PSY 206"]
  },
  {
    slug: "psy-208",
    courseCode: "PSY 208",
    courseTitle: "Positive Psychology",
    session: "2025/2026",
    semester: "Second Semester",
    level: "200 Level",
    status: "confirmed",
    date: "2026-08-13",
    time: "3:00 PM - 6:00 PM",
    examVenue: "CSS Block and NF Room 24",
    topicsToRead: secondSemester200LevelTopicsByCourse["PSY 208"],
    pastQuestions: null
  },
  {
    slug: "psy-210",
    courseCode: "PSY 210",
    courseTitle: "Consumer Psychology",
    session: "2025/2026",
    semester: "Second Semester",
    level: "200 Level",
    status: "confirmed",
    date: "2026-08-18",
    time: "8:00 AM - 11:00 AM",
    examVenue: "NF Room 24 and CSS Block",
    topicsToRead: secondSemester200LevelTopicsByCourse["PSY 210"],
    pastQuestions: secondSemester200LevelPastQuestionsByCourse["PSY 210"]
  },
  {
    slug: "psy-212",
    courseCode: "PSY 212",
    courseTitle: "Introduction to Counselling Psychology",
    session: "2025/2026",
    semester: "Second Semester",
    level: "200 Level",
    status: "confirmed",
    date: "2026-08-18",
    time: "3:00 PM - 6:00 PM",
    examVenue: "CSS Block and NF Room 24",
    topicsToRead: secondSemester200LevelTopicsByCourse["PSY 212"],
    pastQuestions: secondSemester200LevelPastQuestionsByCourse["PSY 212"]
  },
  {
    slug: "psy-202",
    courseCode: "PSY 202",
    courseTitle: "Physiological Psychology",
    session: "2025/2026",
    semester: "Second Semester",
    level: "200 Level",
    status: "confirmed",
    date: "2026-08-24",
    time: "8:00 AM - 11:00 AM",
    examVenue: "SF Room 26",
    topicsToRead: secondSemester200LevelTopicsByCourse["PSY 202"],
    pastQuestions: null
  },
  {
    slug: "psy-214",
    courseCode: "PSY 214",
    courseTitle: "Psychology of Crime and Delinquency",
    session: "2025/2026",
    semester: "Second Semester",
    level: "200 Level",
    status: "confirmed",
    date: "2026-08-25",
    time: "3:00 PM - 6:00 PM",
    examVenue: "NF Room 24 and CSS Block",
    topicsToRead: secondSemester200LevelTopicsByCourse["PSY 214"],
    pastQuestions: null
  },
  {
    slug: "gst-212",
    courseCode: "GST 212",
    courseTitle: "Philosophy, Logic and Human Existence",
    session: "2025/2026",
    semester: "Second Semester",
    level: "200 Level",
    status: "confirmed",
    date: "2026-08-29",
    time: "8:00 AM",
    examVenue: null,
    topicsToRead: secondSemester200LevelTopicsByCourse["GST 212"],
    pastQuestions: null
  },
  {
    slug: "ssc-202",
    courseCode: "SSC 202",
    courseTitle: "Introduction to Computer and its Application",
    session: "2025/2026",
    semester: "Second Semester",
    level: "200 Level",
    status: "current",
    date: "2026-08-28",
    time: "12 Noon – 2 PM",
    examVenue: "NF Room 23",
    topicsToRead: secondSemester200LevelTopicsByCourse["SSC 202"],
    pastQuestions: null
  }
];

export const examRecords: ExamRecord[] = [
  ...archivedFirstSemesterRecords,
  ...currentSecondSemesterRecords,
  ...currentSecondSemester200LevelRecords
];

export function getAllExams() {
  return sortExams(examRecords);
}

export function getExamsByLevel(key: LevelKey) {
  const option = levelOptions.find((level) => level.key === key);

  if (!option) return [];

  return sortExams(
    examRecords.filter(
      (exam) =>
        exam.session === "2025/2026" &&
        exam.semester === "Second Semester" &&
        exam.level === option.level
    )
  );
}

export function isLevelKey(value: string | undefined): value is LevelKey {
  return levelOptions.some((level) => level.key === value);
}

export function getLevelKey(exam: Pick<ExamRecord, "level">): LevelKey {
  return levelOptions.find((level) => level.level === exam.level)?.key ?? defaultLevelKey;
}

export function hasExamSchedule(exam: ExamRecord): exam is ScheduledExamRecord {
  return Boolean(exam.date && exam.time);
}

export function isUpcomingExam(
  exam: Pick<ScheduledExamRecord, "date" | "time">,
  referenceDate = new Date()
) {
  return getExamDateTime(exam).getTime() >= referenceDate.getTime();
}

export function isCompletedExam(
  exam: Pick<ScheduledExamRecord, "date" | "time">,
  referenceDate = new Date()
) {
  return !isUpcomingExam(exam, referenceDate);
}

export function getUpcomingExams(referenceDate = new Date()) {
  return getAllExams()
    .filter(hasExamSchedule)
    .filter((exam) => isUpcomingExam(exam, referenceDate));
}

export function getNextExam(referenceDate = new Date()): ExamRecord | null {
  return getUpcomingExams(referenceDate)[0] ?? null;
}

export function getExamsLeft(referenceDate = new Date()) {
  return getUpcomingExams(referenceDate).length;
}

export function getExamBySlug(slug: string) {
  return examRecords.find((exam) => exam.slug === slug) ?? null;
}

export function getExamDates(exam: Pick<ExamRecord, "date" | "additionalExamDates">) {
  return [...new Set([exam.date, ...(exam.additionalExamDates ?? [])].filter(Boolean))].sort() as string[];
}

export function getExamsByDate(date: string, levelKey: LevelKey) {
  return getExamsByLevel(levelKey)
    .filter(hasExamSchedule)
    .filter((exam) => getExamDates(exam).includes(date));
}

export function getFinalExamDate() {
  return getAllExams().flatMap(getExamDates).sort().at(-1) ?? "";
}

export function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(parseExamDate(date));
}

export function formatWeekdayShort(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short"
  }).format(parseExamDate(date));
}

export function formatDayNumber(date: string) {
  return parseExamDate(date).getDate();
}

export function formatDayMonth(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric"
  }).format(parseExamDate(date));
}

export function parseExamDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getExamDateTime(exam: Pick<ScheduledExamRecord, "date" | "time">) {
  const date = parseExamDate(exam.date);
  const startMinutes = toStartMinutes(exam.time);

  if (startMinutes === null) {
    date.setHours(23, 59, 0, 0);
    return date;
  }

  date.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
  return date;
}

function compareTime(left: string, right: string) {
  const leftMinutes = toStartMinutes(left);
  const rightMinutes = toStartMinutes(right);

  if (leftMinutes === null && rightMinutes === null) return 0;
  if (leftMinutes === null) return 1;
  if (rightMinutes === null) return -1;
  return leftMinutes - rightMinutes;
}

function sortExams(exams: ExamRecord[]) {
  return [...exams].sort((a, b) => {
    if (!a.date && !b.date) return a.courseCode.localeCompare(b.courseCode);
    if (!a.date) return 1;
    if (!b.date) return -1;
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (!a.time && !b.time) return a.courseCode.localeCompare(b.courseCode);
    if (!a.time) return 1;
    if (!b.time) return -1;
    return compareTime(a.time, b.time);
  });
}

function toStartMinutes(time: string) {
  if (/not specified/i.test(time)) return null;

  const normalized = time.replace("–", "-");
  const match = normalized.match(/(\d{1,2})\s*(?::(\d{2}))?\s*(AM|PM)/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  const meridian = match[3].toUpperCase();

  if (meridian === "PM" && hour !== 12) hour += 12;
  if (meridian === "AM" && hour === 12) hour = 0;

  return hour * 60 + minutes;
}
