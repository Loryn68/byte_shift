import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, FileText, Calendar, Users, Brain } from "lucide-react";
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
      title: "Addiction Severity Index (ASI)",
      description: "Comprehensive assessment tool for substance abuse evaluation",
      category: "Assessment",
      icon: <FileText className="h-5 w-5" />,
      content: `
ADDICTION SEVERITY INDEX (ASI)

The ASI addresses 7 main aspects of a person's behavior and environment:

1. MEDICAL STATUS
   - How many days have you experienced medical problems in the past 30 days?
   - Are you taking any prescribed medication on a regular basis for a physical problem?

2. EMPLOYMENT/SUPPORT STATUS
   - Level of education completed?
   - How long was your longest full-time job?
   - How many people depend on you for the majority of their food, shelter, etc.?

3. ALCOHOL USE
   - How many times in your life have you been treated for alcohol abuse?
   - How many days have you been treated in an outpatient setting for alcohol in the past 30 days?

4. DRUG USE
   - How much money would you say you spent during the past 30 days on drugs?
   - How many days have you been treated in an outpatient setting for drugs in the past 30 days?

5. LEGAL STATUS
   - How many times in your life have you been arrested and charged with shoplifting or vandalism?
   - How many times in your life have you been charged with driving while intoxicated?
   - Are you presently awaiting charges, trial, or sentencing?

6. FAMILY/SOCIAL RELATIONSHIPS
   - Do you live with anyone who uses non-prescribed drugs?
   - How many close friends do you have?
   - Has anyone ever abused you?

7. PSYCHIATRIC STATUS
   - How many times have you been treated for any psychological or emotional problems?
   - Have you had a significant period of time (that was not a direct result of drug/alcohol use) in which you have experienced serious anxiety or tension?

Patient Rating Scale (0-4):
0 - Not at all
1 - Slightly
2 - Moderately
3 - Considerably
4 - Extremely

How bothered have you been by these problems in the past 30 days?
How important to you now is treatment for these problems?
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