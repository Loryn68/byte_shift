import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, FileText, Calendar, Users, Brain, Shield, Activity, Heart, BookOpen, Printer } from "lucide-react";
import { useLocation } from "wouter";

const TherapyForms = () => {
  const [, setLocation] = useLocation();

  // Assessment Forms
  const assessmentForms = [
    {
      title: "ACE Questionnaire for Adults",
      description: "Adverse Childhood Experience screening questionnaire",
      category: "Assessment",
      icon: <FileText className="h-5 w-5" />,
      content: `
ADVERSE CHILDHOOD EXPERIENCE QUESTIONNAIRE FOR ADULTS
California Surgeon General's Clinical Advisory Committee

Our relationships and experiences—even those in childhood—can affect our health and well-being. Difficult
childhood experiences are very common. Please tell us whether you have had any of the experiences listed
below, as they may be affecting your health today or may affect your health in the future.

Instructions: Below is a list of 10 categories of Adverse Childhood Experiences (ACEs). From the list
below, please place a checkmark next to each ACE category that you experienced prior to your 18th
birthday. Then, please add up the number of categories of ACEs you experienced and put the total
number at the bottom.

1. Did you feel that you didn't have enough to eat, had to wear dirty clothes, or
   had no one to protect or take care of you? □

2. Did you lose a parent through divorce, abandonment, death, or other reason? □

3. Did you live with anyone who was depressed, mentally ill, or attempted suicide? □

4. Did you live with anyone who had a problem with drinking or using drugs, including
   prescription drugs? □

5. Did your parents or adults in your home ever hit, punch, beat, or threaten to harm each other? □

6. Did you live with anyone who went to jail or prison? □

7. Did a parent or adult in your home ever swear at you, insult you, or put you down? □

8. Did a parent or adult in your home ever hit, beat, kick, or physically hurt you in any way? □

9. Did you feel that no one in your family loved you or thought you were special? □

10. Did you experience unwanted sexual contact (such as fondling or oral/anal/vaginal
    intercourse/penetration)? □

Your ACE score is the total number of checked responses: _______

Do you believe that these experiences have affected your health?    Not Much □  Some □  A Lot □

Experiences in childhood are just one part of a person's life story.
There are many ways to heal throughout one's life.
      `
    },
    {
      title: "ADHD DSM-5 Checklist",
      description: "Comprehensive ADHD assessment based on DSM-5 criteria",
      category: "Assessment",
      icon: <Brain className="h-5 w-5" />,
      content: `
DSM 5 ADHD SYMPTOM CHECKLIST

Name of child: _______________________________ Gender: ______ Age: ______ Date: _____________
Completed by: _________________________________ Telephone #: ____________________________

For each item below, circle the answer that best describes this child.
0=Not at all; 1=Just a Little; 2=Often; 3=Very Often

INATTENTION SYMPTOMS

1. fails to give attention to details or makes careless mistakes in schoolwork, work, or during other
   activities (e.g., overlooks or misses details, work is inaccurate).          0  1  2  3

2. has difficulty sustaining attention to tasks or play activities (e.g., has difficulty remaining focused
   during lectures; conversations; or lengthy reading).                         0  1  2  3

3. does not seem to listen when spoken to directly (e.g., mind seems elsewhere, even in the absence of
   any obvious distraction).                                                    0  1  2  3

4. does not follow through on instructions and fails to finish schoolwork, chores, or duties in the
   workplace (e.g., starts tasks but quickly loses focus and is easily sidetracked).   0  1  2  3

5. has difficulty organizing tasks and activities (e.g., difficulty managing sequential tasks; difficulty
   keeping materials and belongings in order; messy, disorganized with work; has poor time
   management; fails to meet deadlines).                                        0  1  2  3

6. avoids, dislikes, or is reluctant to engage in tasks that require sustained mental effort (e.g.,
   schoolwork or homework; for older adolescents and adults, preparing reports, completing forms,
   reviewing lengthy papers).                                                   0  1  2  3

7. loses things necessary for tasks or activities (e.g., school materials, pencils, books, tools, wallets, keys,
   paperwork, eyeglasses, mobile telephones).                                  0  1  2  3

8. Is easily distracted by extraneous stimuli (for older adolescents and adults, may include unrelated
   thoughts).                                                                   0  1  2  3

9. Is forgetful in daily activities (e.g., chores, errands, returning calls, keeping appointments).   0  1  2  3

HYPERACTIVITY AND IMPULSIVITY SYMPTOMS

1. fidgets with or taps hands or feet or squirms in seat.                      0  1  2  3
2. leaves seat in situations when remaining seated is expected.                0  1  2  3
3. runs about or climbs in situations where it is inappropriate.              0  1  2  3
4. unable to play or engage in leisure activities quietly.                    0  1  2  3
5. is "on the go," acting as if "driven by a motor."                         0  1  2  3
6. talks excessively.                                                         0  1  2  3
7. blurts out an answer before a question has been completed.                 0  1  2  3
8. has difficulty waiting his or her turn.                                   0  1  2  3
9. interrupts or intrudes on others.                                         0  1  2  3
      `
    },
    {
      title: "Addiction Severity Index (ASI) - 5th Edition",
      description: "Clinical/Training Version - Comprehensive assessment tool for substance abuse evaluation",
      category: "Assessment",
      icon: <FileText className="h-5 w-5" />,
      content: `
ADDICTION SEVERITY INDEX - 5TH EDITION
Clinical/Training Version

A. Thomas McLellan, Ph.D., Deni Carise, Ph.D., Thomas H. Coyne, MSW, T. Ron Jackson, MSW

Remember: This is an interview, not a test

INTRODUCING THE ASI: Introduce and explain the seven potential problem areas: Medical, Employment/Support Status, Alcohol, Drug, Legal, Family/Social, and Psychiatric. All clients receive this same standard interview. All information gathered is confidential.

There are two time periods we will discuss:
1. The past 30 days
2. Lifetime

Patient Rating Scale: Patient input is important. For each area, I will ask you to use this scale to let me know how bothered you have been by any problems in each section.

The scale is:
0 - Not at all
1 - Slightly  
2 - Moderately
3 - Considerably
4 - Extremely

HOLLINGSHEAD CATEGORIES:
1. Higher execs, major professionals, owners of large businesses
2. Business managers, lesser professions (nurses, teachers, social workers)
3. Administrative personnel, managers, minor professionals, small business owners
4. Clerical and sales, technicians, small businesses
5. Skilled manual - usually having had training (electrician, mechanic, police, plumber)
6. Semi-skilled (hospital aide, bartender, bus driver, cook, machine operator)
7. Unskilled (attendant, janitor, construction helper, porter, unemployed)

LIST OF COMMONLY USED DRUGS:
Alcohol: Beer, wine, liquor
Methadone: Dolophine, LAAM
Opiates: Pain killers (Morphine, Percocet, Codeine, Fentanyl)
Barbiturates: Nembutal, Seconal, Phenobarbital
Sedatives/Hypnotics/Tranquilizers: Valium, Librium, Ativan, Xanax
Cocaine: Cocaine Crystal, Free-Base Cocaine or "Crack"
Cannabis: Marijuana, hashish
Hallucinogens: LSD, mescaline, PCP, ecstasy
Inhalants: Glue, paint thinner, gasoline
      `
    },
    {
      title: "Beck Depression Inventory (BDI)",
      description: "Self-scored depression assessment questionnaire",
      category: "Assessment", 
      icon: <Brain className="h-5 w-5" />,
      content: `
BECK'S DEPRESSION INVENTORY

This depression inventory can be self-scored. The scoring scale is at the end of the questionnaire.

Instructions: For each group of statements, pick the one that best describes how you have been feeling during the past two weeks, including today.

1. Sadness
   0 I do not feel sad.
   1 I feel sad
   2 I am sad all the time and I can't snap out of it.
   3 I am so sad and unhappy that I can't stand it.

2. Pessimism
   0 I am not particularly discouraged about the future.
   1 I feel discouraged about the future.
   2 I feel I have nothing to look forward to.
   3 I feel the future is hopeless and that things cannot improve.

3. Past Failure
   0 I do not feel like a failure.
   1 I feel I have failed more than the average person.
   2 As I look back on my life, all I can see is a lot of failures.
   3 I feel I am a complete failure as a person.

4. Loss of Pleasure
   0 I get as much satisfaction out of things as I used to.
   1 I don't enjoy things the way I used to.
   2 I don't get real satisfaction out of anything anymore.
   3 I am dissatisfied or bored with everything.

5. Guilty Feelings
   0 I don't feel particularly guilty
   1 I feel guilty a good part of the time.
   2 I feel quite guilty most of the time.
   3 I feel guilty all of the time.

[Continue through all 21 items...]

INTERPRETING THE BECK DEPRESSION INVENTORY:
Add up the score for each question. Highest possible total: 63. Lowest possible: 0.

Scoring:
0-13: Minimal depression
14-19: Mild depression  
20-28: Moderate depression
29-63: Severe depression
      `
    },
    {
      title: "AUDIT Alcohol Screening Tool",
      description: "Alcohol Use Disorders Identification Test for detecting risky drinking patterns",
      category: "Assessment",
      icon: <FileText className="h-5 w-5" />,
      content: `
AUDIT ALCOHOL SCREENING TOOL

The AUDIT (Alcohol Use Disorders Identification Test) is an effective and reliable screening tool for detecting risky and harmful drinking patterns.

INSTRUCTIONS:
1. Answer the following questions about your alcohol use during the past 12 months.
2. Circle one box that best describes your answer to each question.
3. When completed, SCORE them and put your total score in the box.

1. How often do you have a drink containing alcohol?
   0 Never   1 Monthly or less   2 2-4 times a month   3 2-3 times a week   4 4+ times a week

2. How many drinks containing alcohol do you have on a typical day when you are drinking?
   0 1 or 2   1 3 or 4   2 5 or 6   3 7 to 9   4 10 or more

3. How often do you have six or more standard drinks on one occasion?
   0 Never   1 Less than monthly   2 Monthly   3 Weekly   4 Daily or almost daily

4. How often during the last year have you found that you were not able to stop drinking once you had started?
   0 Never   1 Less than monthly   2 Monthly   3 Weekly   4 Daily or almost daily

5. How often during the last year have you failed to do what was normally expected of you because of drinking?
   0 Never   1 Less than monthly   2 Monthly   3 Weekly   4 Daily or almost daily

6. How often during the last year have you needed a drink first thing in the morning to get yourself going after a heavy drinking session?
   0 Never   1 Less than monthly   2 Monthly   3 Weekly   4 Daily or almost daily

7. How often during the last year have you had a feeling of guilt or remorse after drinking?
   0 Never   1 Less than monthly   2 Monthly   3 Weekly   4 Daily or almost daily

8. How often during the last year have you been unable to remember what happened the night before because you had been drinking?
   0 Never   1 Less than monthly   2 Monthly   3 Weekly   4 Daily or almost daily

9. Have you or someone else been injured as a result of your drinking?
   0 No   2 Yes, but not in the last year   4 Yes, during the last year

10. Has a relative or friend or a doctor or another health worker been concerned about your drinking or suggested you cut down?
    0 No   2 Yes, but not in the last year   4 Yes, during the last year

SCORING:
0-7: Lower risk
8-15: Hazardous drinking
16-19: Harmful drinking  
20+: Possible alcohol dependence
      `
    },
    {
      title: "PCL-5 PTSD Checklist",
      description: "Standard PTSD assessment tool for detecting trauma symptoms",
      category: "Assessment",
      icon: <Shield className="h-5 w-5" />,
      content: `
PCL-5 PTSD CHECKLIST

The PCL-5 is a 20-item self-report measure that assesses the 20 DSM-5 symptoms of PTSD.

Instructions: Below is a list of problems and complaints that people sometimes have in response to stressful life experiences. Please read each problem carefully and then circle one of the numbers to the right to indicate how much you have been bothered by that problem in the past month.

Response Options:
0 = Not at all
1 = A little bit  
2 = Moderately
3 = Quite a bit
4 = Extremely

In the past month, how much were you bothered by:

1. Repeated, disturbing, and unwanted memories of the stressful experience?
2. Repeated, disturbing dreams of the stressful experience?
3. Suddenly feeling or acting as if the stressful experience were actually happening again?
4. Feeling very upset when something reminded you of the stressful experience?
5. Having strong physical reactions when something reminded you of the stressful experience?
6. Avoiding memories, thoughts, or feelings related to the stressful experience?
7. Avoiding external reminders of the stressful experience?
8. Trouble remembering important parts of the stressful experience?
9. Having strong negative beliefs about yourself, other people, or the world?
10. Blaming yourself or someone else for the stressful experience or what happened after it?
11. Having strong negative feelings such as fear, horror, anger, guilt, or shame?
12. Loss of interest in activities that you used to enjoy?
13. Feeling distant or cut off from other people?
14. Trouble experiencing positive feelings?
15. Irritable behavior, angry outbursts, or acting aggressively?
16. Taking too many risks or doing things that could cause you harm?
17. Being "super alert" or watchful or on guard?
18. Feeling jumpy or easily startled?
19. Having difficulty concentrating?
20. Trouble falling or staying asleep?

SCORING:
A provisional PTSD diagnosis can be made by treating each item rated as 2 = "Moderately" or higher as a symptom endorsed, then following the DSM-5 diagnostic rule which requires at least: 1 B item (questions 1-5), 1 C item (questions 6-7), 2 D items (questions 8-14), and 2 E items (questions 15-20).

Total Score: _____ (Sum of all items; range 0-80)
      `
    },
    {
      title: "Bipolar Disorder Assessment", 
      description: "Screening tool for identifying bipolar disorder symptoms",
      category: "Assessment",
      icon: <Activity className="h-5 w-5" />,
      content: `
BIPOLAR DISORDER SCREENING

Bipolar disorder is a mental health condition characterized by extreme mood swings that include emotional highs (mania or hypomania) and lows (depression).

MANIC EPISODE SYMPTOMS:
During a manic episode, you may experience:

□ Abnormally upbeat, jumpy or wired
□ Increased activity, energy or agitation
□ Exaggerated sense of well-being and self-confidence (euphoria)
□ Decreased need for sleep
□ Unusual talkativeness
□ Racing thoughts
□ Distractibility
□ Poor decision-making — for example, going on buying sprees, taking sexual risks or making foolish investments

HYPOMANIC EPISODE SYMPTOMS:
A hypomanic episode includes the same symptoms as a manic episode, but they are less severe and don't cause significant problems in social or work functioning.

MAJOR DEPRESSIVE EPISODE SYMPTOMS:
During a major depressive episode, symptoms may include:

□ Depressed mood, such as feeling sad, empty, hopeless or tearful
□ Marked loss of interest or feeling no pleasure in all — or almost all — activities
□ Significant weight loss when not dieting, weight gain, or decrease or increase in appetite
□ Either insomnia or sleeping too much
□ Either restlessness or slowed behavior
□ Fatigue or loss of energy
□ Feelings of worthlessness or excessive or inappropriate guilt
□ Diminished ability to think or concentrate, or indecisiveness
□ Thinking about, planning or attempting suicide

SCREENING QUESTIONS:

1. Have you ever had a period of time when you were not your usual self and...
   □ You felt so good or so hyper that other people thought you were not your normal self?
   □ You were so irritable that you shouted at people or started fights or arguments?
   □ You felt much more self-confident than usual?
   □ You got much less sleep than usual and found you didn't really miss it?
   □ You were much more talkative or spoke much faster than usual?

2. If you checked YES to more than one of the above, have several of these ever happened during the same period of time?

3. How much of a problem did any of these cause you?
   □ No problem
   □ Minor problem  
   □ Moderate problem
   □ Serious problem

Note: This is a screening tool only. Professional diagnosis requires comprehensive clinical evaluation.
      `
    }
  ];

  // Therapy Resources
  const therapyResources = [
    {
      title: "4 Ways to Avoid Negative Thoughts",
      description: "Techniques for managing critical inner voice and negative thinking patterns",
      category: "Coping Skills",
      icon: <Brain className="h-5 w-5" />,
      content: `
4 WAYS TO AVOID NEGATIVE THOUGHTS

HOW WE EXPERIENCE OUR CRITICAL VOICE

People "do not hear voices, per se," but we do notice critical thoughts popping up as we go through our days. We have evolved to experience our thoughts as literal truths. It's what allows us to learn indirectly by listening to what other people say, rather than only directly through our own experience.

Our inner voice is always on, and it's overinclusive in its estimation of what is threatening. These are features, not bugs of our critical voice. It wouldn't be a great threat detector if you could turn it off at will, and it wouldn't be a great threat detector if it somehow underestimated threats.

GETTING STUCK

Our nonstop, always cautious critical voice is an incredible ability, a boon to our survival, but also comes with a dark side.

People run into trouble when they get stuck listening to their mind solely, rather than being out in the world and noticing that sometimes the mind isn't correct about what it thinks.

The critical voice can cause people to focus solely on avoiding unwanted thoughts and to avoid situations that trigger those thoughts. This is defined as "experiential avoidance."

If it's our default for managing unwanted thoughts, it can trap us, such that we lose our focus on other, more important things in our lives. Not only does this focus on getting stuff out of our heads capture our attention, but it also often backfires—sometimes the more you try not to think about something, the more it sticks around.

DETACHING FROM THAT CRITICAL VOICE

Having a critical, threat-detecting mind isn't the problem. Rather, it's our response to that critical mind that can trap us.

4 EFFECTIVE STRATEGIES:

1. ACKNOWLEDGE THE VOICE
   Recognize when your critical voice is speaking and acknowledge it without judgment.

2. QUESTION THE THOUGHTS
   Ask yourself: "Is this thought helpful? Is it true? What evidence supports or contradicts it?"

3. PRACTICE MINDFULNESS
   Observe your thoughts without getting caught up in them. You are not your thoughts.

4. REDIRECT YOUR ATTENTION
   Focus on what you can control and take action aligned with your values.
      `
    },
    {
      title: "9 Ways to Improve Mental Health Today",
      description: "Practical daily strategies for better mental well-being",
      category: "Self-Care",
      icon: <Users className="h-5 w-5" />,
      content: `
9 WAYS YOU CAN IMPROVE YOUR MENTAL HEALTH TODAY

Mental health is much more than a diagnosis. It's your overall psychological well-being—the way you feel about yourself and others as well as your ability to manage your feelings and deal with everyday difficulties.

1. TELL YOURSELF SOMETHING POSITIVE
Research shows that how you think about yourself can have a powerful effect on how you feel. Practice using words that promote feelings of self-worth and personal power.

2. WRITE DOWN SOMETHING YOU ARE GRATEFUL FOR
Gratitude has been clearly linked with improved well-being and mental health, as well as happiness. Keep a gratitude journal or write a daily gratitude list.

3. FOCUS ON ONE THING (IN THE MOMENT)
Being mindful of the present moment allows us to let go of negative or difficult emotions from past experiences. Start by bringing awareness to routine activities.

4. EXERCISE
Your body releases stress-relieving and mood-boosting endorphins before and after you work out. Look for small ways to add activity to your day.

5. EAT A GOOD MEAL
What you eat nourishes your whole body, including your brain. Include foods with Omega-3 polyunsaturated fatty acids.

6. OPEN UP TO SOMEONE
Expressing yourself and getting support from others can help you feel less alone and more capable of coping with stress.

7. DO SOMETHING FOR SOMEONE ELSE
Research shows that being helpful to others has a beneficial effect on how you feel about yourself.

8. TAKE A BREAK
Take time to do activities you enjoy. Make time for reflection and appreciation.

9. GO TO BED ON TIME
Sleep affects your ability to think clearly, quality of mood, and ability to cope with stress.
      `
    },
    {
      title: "10 Steps to Cultivating Positive Thoughts",
      description: "Building blocks for developing a positive mindset and attitude",
      category: "Mindset",
      icon: <Brain className="h-5 w-5" />,
      content: `
10 STEPS TO CULTIVATING POSITIVE THOUGHTS AND ATTITUDE

1. TRY A NEW HOBBY
A hobby is the pick-me-up everyone needs. Pick up a hobby that keeps your hands busy, such as puzzling, knitting, gardening or painting.

2. START A FITNESS ROUTINE
Moving every day does wonders for your mind and body. The best type of exercise is one you enjoy doing.

3. PRIORITIZE CONNECTING WITH FAMILY AND FRIENDS
Your friends and family are your biggest cheerleaders. Having a strong social support network is the best way to combat loneliness.

4. TAKE A WARM BATH
Soaking in a warm bath after a long day delivers many health benefits, including improved sleep, reduced stress and increased circulation.

5. VOLUNTEER
Helping others is good for the soul. Research suggests altruism makes us happier and live longer.

6. PRACTICE GRATITUDE DAILY
Take time each day to acknowledge the good things in your life, no matter how small.

7. LIMIT NEGATIVE MEDIA CONSUMPTION
Be mindful of how much negative news and social media you consume daily.

8. PRACTICE DEEP BREATHING
Simple breathing exercises can help reduce stress and anxiety while promoting relaxation.

9. SET REALISTIC GOALS
Break larger goals into smaller, achievable steps to build confidence and momentum.

10. CELEBRATE SMALL WINS
Acknowledge and celebrate your progress, no matter how small the achievement.
      `
    },
    {
      title: "Confronting Avoidance - ACT Skill",
      description: "ACT skill worksheet for addressing avoidance behaviors",
      category: "Coping Skills",
      icon: <Brain className="h-5 w-5" />,
      content: `
CONFRONTING AVOIDANCE - ACT SKILL

It's normal to avoid or push away whatever feels intense or uncomfortable, but this only works for a while. Over time, resisting difficult thoughts and emotions makes them worse and drains your vitality.

COMMONLY AVOIDED EXPERIENCES:

THOUGHTS: Thoughts that evoke strong emotions, have disturbing content, or trigger anxiety
EMOTIONS: Any intense feelings, especially heavier states such as guilt, anger, or grief  
SENSATIONS: Physical discomfort or actual pain, particularly when part of a chronic condition

TYPICAL AVOIDANCE STRATEGIES:

DISTRACTION: While useful in small doses, distraction quickly becomes a way of resisting what you're experiencing. Examples include excessively watching TV, checking your phone, or overworking.

DENIAL: This involves pushing away difficult internal states so you don't have to acknowledge or deal with them. Denial can work short term, but soon traps you in a fantasy world.

PROJECTION: When you don't like what you're feeling, you may externalize it onto others. This allows you to avoid taking ownership of your feelings.

OPTING OUT: If you're unwilling to confront tough emotions, you may avoid people, places, and situations that are likely to bring up uncomfortable feelings.

EXERCISES:

1. Name what you are avoiding.
What do you push away most (e.g., anger, physical pain, difficult thought, etc.)?

What's the cost of avoiding this and how could you benefit from confronting it?

2. Examine your limiting beliefs.
Write down two beliefs related to what you listed, such as the belief that certain emotions are dangerous, wrong, or proof of weakness.

Are these beliefs 100% true? If not, what would be a more balanced view?

3. Welcome your difficult experiences.
Identify a situation that often brings up the undesired thought, emotion, or sensation.

Describe two ways you can welcome this experience the next time it arises.

© 2023 Therapist Aid LLC
      `
    },
    {
      title: "Being Assertive and Vocal",
      description: "Techniques for developing assertiveness and confident communication",
      category: "Self-Care",
      icon: <Users className="h-5 w-5" />,
      content: `
BEING ASSERTIVE AND VOCAL

Assertiveness is a communication style. It is the ability to honestly and appropriately express your feelings, thoughts, beliefs, opinions, attitudes and rights, in an open manner without undue anxiety, in a way that doesn't infringe on the rights of others.

TOP 10 TIPS FOR ASSERTIVENESS:

1. USE EMPOWERED VERBAL AND BODY LANGUAGE
Replace 'but' with 'and,' 'I should' with 'I will' and 'I'll try to' with 'I'll aim to.' Project confidence with good posture and eye contact.

2. GET OUT OF YOUR COMFORT ZONE
Nothing changes if nothing changes. Practice makes perfect and like a muscle, assertiveness needs limbering up to work at its strongest.

3. FOCUS ON CLEAR AND CALM COMMUNICATION
Stay calm, clear-headed and collected. Keep emotion out of it, keep it professional. Stick to the facts to support your opinions – don't exaggerate.

4. BE TRUE TO YOURSELF
Staying true to your values allows you to be more confident. People can sense authenticity from miles away.

5. DON'T BE AFRAID TO SPEAK UP AND SHARE YOUR THOUGHTS. BE DIRECT.
If you've struck the balance between assertiveness and arrogance, you needn't worry about offending anyone by expressing your opinion, provided you can back up your points.

6. UNDERSTAND THE DIFFERENCE BETWEEN ASSERTIVENESS AND ARROGANCE
Assertive: Open to other opinions, listens to others, acts constructively and inclusively, states opinion decisively
Arrogant: Believes only their opinion matters, ignores everyone else, dictates, shouts and argues

7. OBSERVE ASSERTIVE ROLE MODELS
Study the body language and expression of people who exude the confidence you wish you could have.

8. PRACTICE SAYING NO
Learn to decline requests that don't align with your priorities or values. Always offer an alternative when possible.

BENEFITS OF BEING ASSERTIVE:
- Gain self-confidence and self-esteem
- Understand and recognize your feelings
- Earn respect from others
- Improve communication
- Create win-win situations
- Improve decision-making skills
- Create honest relationships
      `
    },
    {
      title: "Being at Peace with Self",
      description: "Strategies for finding inner peace and self-acceptance",
      category: "Mindset",
      icon: <Brain className="h-5 w-5" />,
      content: `
BEING AT PEACE WITH SELF

"He who lives in harmony with himself lives in harmony with the world." ~Marcus Aurelius

How can I find peace of mind? The answer lies in what you do. You create your state of mind by the things you do, and you cement that by the things you tell yourself.

As long as I behave with integrity every day, I can feel at peace with myself.

Things will always change. Life will sometimes be tough. People will say and do things that upset you. That's just the nature of things. As long as you hang onto your integrity, no matter what is happening in your world, you can go to bed with a clear conscience.

TIPS TO HELP YOU CULTIVATE A SENSE OF PEACE:

1. KNOW YOUR IDEAL SELF
Make a list of all the good qualities you intend to cultivate. Are you going to be kinder, fairer, more tolerant, more patient, more dignified? What principles do you wish to uphold?

2. DO THE NEXT RIGHT THING
If you've been struggling emotionally or mentally, it may be difficult to act with integrity all the time. Practice doing the "next right thing" all the time to build up this habit.

3. LET GO OF PERFECTIONISM
Validate the attempts you're making to do the right thing even when things are a struggle. Allow yourself to be imperfect, and yet still make progress.

4. MAKE AMENDS IMMEDIATELY
When you do something that goes against your values, make it right as soon as possible. Apologize, make amends, and commit to doing better.

5. PRACTICE SELF-COMPASSION
Treat yourself with the same kindness you would show a good friend. Acknowledge your mistakes without harsh self-judgment.

6. LIVE BY YOUR VALUES
Identify what matters most to you and make decisions that align with those values, even when it's difficult.

7. CULTIVATE GRATITUDE
Regularly acknowledge the good things in your life, no matter how small they may seem.

Remember: Peace of mind comes from acting with integrity and treating yourself with compassion, not from external circumstances or achievements.
      `
    },
    {
      title: "Understanding Triggers",
      description: "Comprehensive guide to identifying and managing personal triggers",
      category: "Coping Skills",
      icon: <Brain className="h-5 w-5" />,
      content: `
WHAT IS A TRIGGER?

To be triggered is to experience an emotional reaction to something based on a previous negative experience. Triggers can be people, scents, places, harmful substances, or anything else that serves as reminders for intense or distracting emotions.

EXTERNAL AND INTERNAL TRIGGERS:

INTERNAL TRIGGERS:
- Shame/guilt/anger/regret
- Depression and anxiety
- Inconsistency
- A loss of control
- Heartbreak, job loss or grief
- Stress or fear
- Feeling unsafe, feeling misunderstood

EXTERNAL TRIGGERS:
- Specific places (home, streets, cities, countries)
- Trauma/PTSD and abuse
- Feeling judged, feeling attacked, feeling invalidated
- Sights, smells, conflict, aggression, news stories, books, and memories

TRIGGER MANAGEMENT - HEALTHY COPING SKILLS:

✓ Exercising
✓ Resting
✓ Therapy or counseling
✓ Meditation or mindfulness
✓ Spending time with positive people
✓ Drinking water or tea for relaxation/hydration
✓ Joining a support group
✓ Eating nutritional meals
✓ Using positive distractions
✓ Reframing negative attitudes or perceptions

TRIGGER MANAGEMENT - UNHEALTHY COPING SKILLS (TO AVOID):

✗ Misdirected anger
✗ Violence
✗ Emotional, psychological, sexual, financial, or mental abuse
✗ Making excuses for harmful behavior
✗ Self-harm
✗ Developing poor behavioral compulsions
✗ Abusing harmful substances
✗ Binge eating or drinking
✗ Lying/Denial
✗ Bottling it up
✗ Exploding with anger or rage

Remember: Being self-aware allows for individuals to understand the driving force behind their behavior, or the trigger before and after they react.
      `
    },
    {
      title: "What is Burnout?",
      description: "Understanding burnout symptoms, causes, and recovery strategies",
      category: "Self-Care",
      icon: <Heart className="h-5 w-5" />,
      content: `
WHAT IS BURNOUT?

Burnout is a state of complete mental, physical, and emotional exhaustion. If you are experiencing burnout, you may notice it is difficult to engage in activities you normally find meaningful.

SIGNS AND SYMPTOMS OF BURNOUT:

PHYSICAL SYMPTOMS:
- Headaches
- Stomachaches/intestinal issues
- Fatigue
- Frequent illness
- Changes in appetite/sleep

EMOTIONAL SYMPTOMS:
- Helplessness
- Cynicism
- Sense of failure or self-doubt
- Decreased satisfaction
- Feeling detached or alone in the world
- Loss of motivation

BEHAVIORAL SIGNS:
- Reduced performance in everyday tasks
- Withdrawal or isolation
- Procrastination
- Outbursts
- Using substances to cope

CAUSES OF BURNOUT:

WORK-RELATED CAUSES:
- Having little or no control over your work
- Lack of recognition
- Overly demanding job expectations
- Monotonous or unchallenging work
- Chaotic or high-pressure environment

LIFESTYLE CAUSES:
- Working too much, without socializing or relaxing
- Lack of close, supportive relationships
- Too many responsibilities, without enough help
- Not enough sleep

PERSONALITY TRAITS:
- Perfectionistic tendencies
- Pessimistic view of yourself and the world
- Need to be in control
- High achieving in nature

REGAINING BALANCE IN YOUR LIFE:

✓ Turn to other people for support: friends, colleagues, or community groups
✓ Reframe the way you look at work or your home life by finding value, meaning and balance
✓ Reevaluate your priorities by taking time off or regular breaks during the day
✓ Nourishing your creativity by doing something interesting
✓ Make physical activity a priority to boost your mood and energy
✓ Support your body with a healthy diet and quality sleep

Taking a few moments each day to nurture your mental wellbeing will help you be a happier and more resilient you. You deserve the best possible you!
      `
    },
    {
      title: "Understanding Values",
      description: "Exploring personal values and their impact on behavior and decision-making",
      category: "Self-Discovery",
      icon: <Users className="h-5 w-5" />,
      content: `
WHAT IS A VALUE?

Values are qualities, characteristics, or ideas about which we feel strongly. Our values affect our decisions, goals and behavior. A belief or feeling that someone or something is worthwhile.

VALUES DEFINE:
- What is of worth
- What is beneficial  
- What is harmful
- Standards to guide your action, judgments, and attitudes

VALUES GIVE DIRECTION:
- Values give direction and consistency to behavior
- Values help you know what to and not to make time for
- Values establish a relationship between you and the world
- Values set the direction for one's life

WHERE DO WE GET VALUES?
- Our homes
- School
- Society
- Friends
- TV
- Church
- Music
- Books
- Families
- Culture
- Employers
- Time-period in which you were raised

YOUR AGE INFLUENCES YOUR VALUES:
- Ages 1-7: Parents
- Ages 8-13: Teachers, heroes (sports, rocks, TV)
- Ages 14-20: Peers
- Ages 21+: Your values are established, but you may test them from time to time

VALUE VERSUS FACTS:

VALUES are things we feel "should", "ought", or "are supposed to" influence our lives.
FACTS simply state what actually are.

Example:
VALUE: All people should be active in a specific religion.
FACT: Many people are active in a specific religion.

TYPES OF VALUES:
- Moral
- Material
- Aesthetic
- Intrinsic
- Extrinsic
- Universal/American
- Group specific values

REMEMBER:
"If you stand for nothing, you fall for anything."
"It's not doing things right, but doing the right things."

Happiness comes from letting values decide your behavior and goals.
      `
    },
    {
      title: "Understanding Self-Image",
      description: "Exploring self-perception and building a positive self-image",
      category: "Self-Discovery",
      icon: <Brain className="h-5 w-5" />,
      content: `
WHAT IS SELF-IMAGE?

Self-image refers to how we see ourselves on a more global level, both internally and externally. It is "the idea, conception, or mental image one has of oneself."

THE THREE ELEMENTS OF SELF-IMAGE:

1. The way a person perceives or thinks of him/herself
2. The way a person interprets others' perceptions (or what he thinks others think) of him/herself
3. The way a person would like to be (his ideal self)

THE SIX DIMENSIONS OF SELF-IMAGE:

1. PHYSICAL DIMENSION: How a person evaluates his or her appearance
2. PSYCHOLOGICAL DIMENSION: How a person evaluates his or her personality
3. INTELLECTUAL DIMENSION: How a person evaluates his or her intelligence
4. SKILLS DIMENSION: How a person evaluates his or her social and technical skills
5. MORAL DIMENSION: How a person evaluates his or her values and principles
6. SEXUAL DIMENSION: How a person feels he or she fits into society's masculine/feminine norms

EXAMPLES OF POSITIVE SELF-IMAGE:
✓ Seeing yourself as an attractive and desirable person
✓ Having an image of yourself as a smart and intelligent person
✓ Seeing a happy, healthy person when you look in the mirror
✓ Believing that you are at least somewhat close to your ideal version of yourself
✓ Thinking that others perceive you positively as well

EXAMPLES OF NEGATIVE SELF-IMAGE:
✗ Seeing yourself as unattractive and undesirable
✗ Having an image of yourself as a stupid or unintelligent person
✗ Seeing an unhappy, unhealthy person when you look in the mirror
✗ Believing that you are nowhere near your ideal version of yourself
✗ Thinking that others perceive you negatively

THE IMPORTANCE OF POSITIVE SELF-IMAGE:

Having a distorted self-image means that you have a view of yourself that is not based in reality. When your self-image is greatly detached from reality, it can cause serious emotional and psychological problems.

Remember: A healthy self-image is based on reality and includes both strengths and areas for growth, while maintaining overall self-acceptance and self-respect.
      `
    }
  ];

  // Addiction Resources
  const addictionResources = [
    {
      title: "12 Steps of AA",
      description: "The foundational twelve-step program for addiction recovery",
      category: "Recovery",
      icon: <FileText className="h-5 w-5" />,
      content: `
THE TWELVE STEPS OF ALCOHOLICS ANONYMOUS

The Twelve Steps are a set of guiding principles in addiction treatment that outline a course of action for tackling problems related to alcoholism, drug addiction and behavioral compulsion.

STEP 1: We admitted we were powerless over alcohol—that our lives had become unmanageable.

STEP 2: Came to believe that a Power greater than ourselves could restore us to sanity.

STEP 3: Made a decision to turn our will and our lives over to the care of God as we understood Him.

STEP 4: Made a searching and fearless moral inventory of ourselves.

STEP 5: Admitted to God, to ourselves, and to another human being the exact nature of our wrongs.

STEP 6: Were entirely ready to have God remove all these defects of character.

STEP 7: Humbly asked Him to remove our shortcomings.

STEP 8: Made a list of all persons we had harmed, and became willing to make amends to them all.

STEP 9: Made direct amends to such people wherever possible, except when to do so would injure them or others.

STEP 10: Continued to take personal inventory and when we were wrong promptly admitted it.

STEP 11: Sought through prayer and meditation to improve our conscious contact with God, as we understood Him, praying only for knowledge of His will for us and the power to carry that out.

STEP 12: Having had a spiritual awakening as the result of these Steps, we tried to carry this message to alcoholics, and to practice these principles in all our affairs.

HOW AND WHY DO THE TWELVE STEPS WORK?

The Steps encourage the practice of honesty, humility, acceptance, courage, compassion, forgiveness and self-discipline—spiritual principles that members use to help maintain their sobriety.
      `
    },
    {
      title: "10 Most Common Triggers of Substance Abuse Relapse",
      description: "Understanding and managing relapse triggers in recovery",
      category: "Recovery",
      icon: <FileText className="h-5 w-5" />,
      content: `
10 MOST COMMON TRIGGERS OF SUBSTANCE ABUSE RELAPSE

1. WITHDRAWAL SYMPTOMS (anxiety, nausea, physical weakness)
2. POST-ACUTE WITHDRAWAL SYMPTOMS (anxiety, irritability, mood swings, poor sleep)
3. POOR SELF-CARE (stress management, eating, sleeping)
4. PEOPLE (old using friends)
5. PLACES (where you used or where you used to buy drugs)
6. THINGS (that were part of your using, or that remind you of using)
7. UNCOMFORTABLE EMOTIONS (H.A.L.T.: hungry, angry, lonely, and tired)
8. RELATIONSHIPS AND SEX (can be stressful if anything goes wrong)
9. ISOLATION (gives you too much time to be with your own thoughts)
10. PRIDE AND OVERCONFIDENCE (thinking you don't have a drug or alcohol problem)

THE STAGES OF RELAPSE

Relapse is a process, it's not an event. There are three stages of relapse:

1. EMOTIONAL RELAPSE
Signs: Anxiety, intolerance, anger, defensiveness, mood swings, isolation, not asking for help, not going to meetings, poor eating habits, poor sleep habits.

2. MENTAL RELAPSE
Signs: Thinking about people, places, and things you used with; glamorizing past use; lying; hanging around old using friends; planning a relapse.

3. PHYSICAL RELAPSE
This is when you actually start using again.

EARLY RELAPSE PREVENTION

Recognize that you're in emotional relapse and change your behavior. Practice self-care. The most important thing you can do to prevent relapse is take better care of yourself.
      `
    },
    {
      title: "Addiction Discussion Questions",
      description: "Therapeutic discussion prompts for addiction counseling",
      category: "Discussion",
      icon: <Users className="h-5 w-5" />,
      content: `
ADDICTION DISCUSSION QUESTIONS

1. How has your relationship with drugs changed from the time that you first used to now? Do you still use for the same reasons, or have those reasons changed?

2. How did your functioning change at work or school after you started using? Even if you're able to keep up with your responsibilities while you use, how do you think sobriety would change things?

3. What are some rituals or activities that you associate with drug use, and how do you feel about giving them up? Do you think you could achieve sobriety without changing your lifestyle?

4. What choices does a person have, other than drug use, when they are confronted with painful emotions like anger, depression, and anxiety? What emotions might lead you to using drugs or alcohol?

5. Some people say that addiction is a disease, and others believe it's a choice. What do you think, and why? How do you believe counseling, support groups, or other treatments could help a person who struggles with addiction?

6. Have you done things under the influence of drugs that you wouldn't have done while sober? Have you noticed any behavior patterns that occur only when you're intoxicated?

These questions are designed to stimulate dialogue and self-reflection about addiction patterns, triggers, and recovery goals.
      `
    }
  ];

  // ACT Worksheet
  const actWorksheet = {
    title: "ACT Worksheet - Becoming Psychologically Flexible",
    description: "Acceptance and Commitment Therapy skill-building worksheet",
    category: "Therapy Tools",
    icon: <Brain className="h-5 w-5" />,
    content: `
BECOMING PSYCHOLOGICALLY FLEXIBLE - ACT SKILL

Psychological flexibility is the ability to adapt to life's difficulties while remaining true to one's values. This skill consists of six key components:

1. ACCEPTANCE
Embrace your inner experience. What you resist tends to persist. Let go of your struggle against uncomfortable thoughts, emotions, and sensations.

Action Step: Notice the next time you try to push away an unpleasant emotion. Instead, allow it to be there, and explore how it feels in your body.

2. DETACHMENT FROM THOUGHTS
Learn to step back from your thoughts. Thoughts are often distorted interpretations that reflect our fears and insecurities more than reality.

Action Step: Imagine your thoughts projected onto a movie screen. Sit in the back row and watch the scenes unfold.

3. PRESENT-FOCUSED PERSPECTIVE
Live in the now – not the past or future. Your entire life takes place in the present moment.

Action Step: When you're lost in thought, engage your senses. Notice two things you can see, hear, and smell.

4. OBSERVING SELF
Connect with the "observing self." The thinking self is always analyzing, but the observing self simply notices without getting caught up.

Action Step: Bring attention to your thoughts. Ask yourself, "Am I these thoughts, or am I the one who is aware of these thoughts?"

5. VALUES CLARIFICATION
Explore and define your highest values. What is most important to you in this life?

Action Step: Write down your top 5 values and reflect on how well your current actions align with them.

6. VALUES ENACTMENT
Put your values into action. Values are like a compass – they point you in the right direction.

Action Step: Choose one small action you can take today that moves you closer to living your values.

© 2023 Therapist Aid LLC
    `
  };

  // Inspirational Stories
  const inspirationalStories = {
    title: "12 Stories That'll Change the Way You Perceive Life",
    description: "Short inspirational stories for reflection and motivation",
    category: "Inspiration",
    icon: <FileText className="h-5 w-5" />,
    content: `
12 STORIES THAT'LL CHANGE THE WAY YOU PERCEIVE LIFE

1. THE GROUP OF FROGS
A group of frogs were traveling through the forest when two fell into a deep pit. The other frogs said there was no hope. One frog gave up and died, but the other kept jumping. When he finally escaped, he explained he was deaf and thought they were encouraging him the entire time.

Moral: People's words can have a huge effect on others' lives. Think before you speak.

2. A POUND OF BUTTER
A farmer sold butter to a baker who discovered he wasn't getting the full amount. In court, the farmer revealed he had been using the baker's own one-pound loaf of bread as his measure for the butter.

Moral: In life, you get what you give. Don't try to cheat others.

3. THE OBSTACLE IN OUR PATH
A king placed a boulder on a road and watched to see who would move it. Wealthy merchants walked around it, but a peasant moved it and found a purse of gold coins underneath with a note from the king.

Moral: Every obstacle gives us an opportunity to improve our circumstances.

4. THE BUTTERFLY
A man found a cocoon and watched a butterfly struggling to emerge. He cut the cocoon to help, but the butterfly's wings were weak and it couldn't fly. The struggle was necessary to strengthen its wings.

Moral: Struggles develop our strength. Without them, we never grow stronger.

These stories remind us that our perspective shapes our reality, and challenges often lead to growth and opportunity.
    `
  };

  // All forms array
  const allForms = [
    aceQuestionnaire,
    adhdScreening,
    addictionSeverityIndex,
    auditAlcoholScreening,
    beckDepressionInventory,
    pcl5PtsdChecklist,
    bipolarDisorderScreening,
    defensesMechanisms,
    strengthBasedApproach,
    triggerUnderstanding,
    avoidanceConfrontation,
    burnoutRecognition,
    valuesExploration,
    selfImageBuilding,
    positiveThinkingStrategies,
    peaceAndStrength,
    assertivenessTraining,
    dbtSkills,
    actTools,
    inspirationalStories
  ];

  // Categories for filtering
  const categories = ["All", "Assessments", "Coping Skills", "Self-Discovery", "Mindset", "ACT Tools", "Inspiration"];

  // Filter forms by category
  const filteredForms = selectedCategory === "All" 
    ? allForms 
    : allForms.filter(form => form.category === selectedCategory);

  const printForm = (content: string, title: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const formattedContent = content.replace(/\n/g, '<br>');
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: 'Times New Roman', serif; line-height: 1.6; padding: 20px; }
              h1 { color: #2c5aa0; text-align: center; }
              h2 { color: #2c5aa0; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #2c5aa0; }
              .tagline { font-style: italic; color: #666; }
              .content { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">Child Mental Haven</div>
              <div class="tagline">Where Young Minds Evolve</div>
            </div>
            <h1>${title}</h1>
            <div class="content">${formattedContent}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">Therapy Forms & Resources</h1>
        <p className="text-center text-gray-600">Comprehensive mental health assessment tools and therapeutic resources</p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map((form, index) => (
                <FormCard
                  key={index}
                  form={form}
                  onPrint={() => printForm(form.content, form.title)}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TherapyForms;

WHEN IS DBT USED?

Originally used to treat borderline personality disorder, but now helps treat:
- Depression
- Binge-eating
- Bulimia  
- PTSD
- Bipolar disorder
- Substance abuse

WHY DOES DBT TEACH SKILLS?

Behaviors that are problematic start to evolve as a way to cope with either a situation or solve a problem. While this can provide temporary relief in the short-term, it's not helpful long-term.

DBT assumes that clients are trying as best as possible and that they need to learn behaviors in different contexts. These skills allow the person to navigate and handle situations within everyday life.

HOW DOES IT WORK?

DBT helps with different case management by teaching the client to be their own case manager. The therapist is more of a consultant and can interact and stop anything as necessary.

Those who suffer from intense emotions find these become a problem when they're interacting with other people, including friends, romantic partners, and family members.

DBT SKILLS HELP WITH:
- Improving and regulating emotions
- Allowing for more tolerance of distress and negative emotion  
- Allowing the person to be mindful and present within the moment
- Improving communication and ability to interact with others
    `
  },
  {
    title: "Strength-Based Therapy Approach",
    description: "Focusing on what's right rather than what's wrong",
    category: "Mindset",
    icon: <Heart className="h-5 w-5" />,
    content: `
WHAT IS RIGHT VS WHAT IS WRONG

TRADITIONAL THERAPY PROBLEMS:
Much of the therapies focus upon the client's:
- Problem history
- Their deficits  
- Their pathology
- Their problem patterns
- Their unresolved issues
- Their unfinished business

At times it can seem as if not much of the client is functioning well.

A BETTER AND NOT HARMFUL APPROACH IS THE OPPOSITE:

FOCUS ON:
✓ What is RIGHT not what is WRONG
✓ What WORKS not what does NOT work  
✓ What the past has TAUGHT or GIVEN you, not on how it has WEAKENED you
✓ STRENGTHS not weaknesses
✓ What you CAN DO, not on what you CANNOT do

BENEFITS OF STRENGTH-BASED APPROACH:

1. BUILDS CONFIDENCE
Focusing on strengths and capabilities builds self-efficacy and confidence.

2. CREATES POSITIVE MOMENTUM  
Success builds on success when we acknowledge what's working.

3. DEVELOPS RESILIENCE
Understanding our strengths helps us navigate future challenges.

4. IMPROVES SELF-IMAGE
Recognizing our positive qualities and achievements enhances self-worth.

5. ENCOURAGES GROWTH
Building from strengths provides a solid foundation for continued development.

IMPLEMENTATION:
- Identify three things you do well
- Recognize past successes and what made them possible
- Notice daily accomplishments, however small
- Ask yourself: "What's working in my life right now?"
- Build on existing strengths rather than trying to fix weaknesses

Remember: Everyone has strengths, capabilities, and resources. The goal is to identify and build upon these positive aspects to create meaningful change and growth.
    `
  };

  const printForm = (formContent: string, title: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                line-height: 1.6;
                color: #333;
              }
              h1 { 
                color: #2563eb; 
                border-bottom: 2px solid #2563eb; 
                padding-bottom: 10px;
              }
              pre { 
                white-space: pre-wrap; 
                font-family: Arial, sans-serif;
                font-size: 12px;
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <pre>${formContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const FormCard = ({ form, onPrint }: { form: any; onPrint: () => void }) => (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {form.icon}
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {form.title}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">{form.description}</p>
            </div>
          </div>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {form.category}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded text-xs font-mono max-h-32 overflow-hidden">
            {form.content.substring(0, 200)}...
          </div>
          <Button 
            onClick={onPrint}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Print Form
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/therapy")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Therapy
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Therapy Forms & Resources</h1>
                <p className="text-sm text-gray-600">Comprehensive mental health assessment tools and therapeutic resources</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="assessments" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="assessments" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Assessments</span>
            </TabsTrigger>
            <TabsTrigger value="coping" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Coping Skills</span>
            </TabsTrigger>
            <TabsTrigger value="addiction" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Addiction</span>
            </TabsTrigger>
            <TabsTrigger value="act" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>ACT Tools</span>
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Stories</span>
            </TabsTrigger>
          </TabsList>

          {/* Assessment Forms */}
          <TabsContent value="assessments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assessmentForms.map((form, index) => (
                <FormCard
                  key={index}
                  form={form}
                  onPrint={() => printForm(form.content, form.title)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Coping Skills & Self-Care */}
          <TabsContent value="coping" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {therapyResources.map((form, index) => (
                <FormCard
                  key={index}
                  form={form}
                  onPrint={() => printForm(form.content, form.title)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Addiction Resources */}
          <TabsContent value="addiction" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {addictionResources.map((form, index) => (
                <FormCard
                  key={index}
                  form={form}
                  onPrint={() => printForm(form.content, form.title)}
                />
              ))}
            </div>
          </TabsContent>

          {/* ACT Tools */}
          <TabsContent value="act" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormCard
                form={actWorksheet}
                onPrint={() => printForm(actWorksheet.content, actWorksheet.title)}
              />
            </div>
          </TabsContent>

          {/* Inspirational Stories */}
          <TabsContent value="stories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormCard
                form={inspirationalStories}
                onPrint={() => printForm(inspirationalStories.content, inspirationalStories.title)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TherapyForms;