import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, FileText, Calendar, Users, Brain, Shield, Activity, Heart, BookOpen, Printer } from "lucide-react";
import { useLocation } from "wouter";

const TherapyForms = () => {
  const [, setLocation] = useLocation();
  const [selectedForm, setSelectedForm] = useState<any>(null);

  // Assessment Forms Data
  const assessmentForms = [
    {
      id: 1,
      title: "ACE Questionnaire for Adults",
      description: "Adverse Childhood Experience screening questionnaire",
      category: "Assessment",
      icon: <FileText className="h-5 w-5" />,
      content: `ADVERSE CHILDHOOD EXPERIENCE QUESTIONNAIRE FOR ADULTS
California Surgeon General's Clinical Advisory Committee

Our relationships and experiences—even those in childhood—can affect our health and well-being. Difficult childhood experiences are very common. Please tell us whether you have had any of the experiences listed below, as they may be affecting your health today or may affect your health in the future.

Instructions: Below is a list of 10 categories of Adverse Childhood Experiences (ACEs). From the list below, please place a checkmark next to each ACE category that you experienced prior to your 18th birthday. Then, please add up the number of categories of ACEs you experienced and put the total number at the bottom.

1. Did you feel that you didn't have enough to eat, had to wear dirty clothes, or had no one to protect or take care of you? □

2. Did you lose a parent through divorce, abandonment, death, or other reason? □

3. Did you live with anyone who was depressed, mentally ill, or attempted suicide? □

4. Did you live with anyone who had a problem with drinking or using drugs, including prescription drugs? □

5. Did your parents or adults in your home ever hit, punch, beat, or threaten to harm each other? □

6. Did you live with anyone who went to jail or prison? □

7. Did a parent or adult in your home ever swear at you, insult you, or put you down? □

8. Did a parent or adult in your home ever hit, beat, kick, or physically hurt you in any way? □

9. Did you feel that no one in your family loved you or thought you were special? □

10. Did anyone ever touch you in a sexual way or make you touch them when you didn't want to be touched? □

Total ACE Score: ____/10

SCORING:
• 0 ACEs: 12% of the population
• 1 ACE: 22% of the population  
• 2 ACEs: 16% of the population
• 3 ACEs: 12% of the population
• 4+ ACEs: 38% of the population

Higher ACE scores are linked to increased risk for health problems in adulthood, including substance abuse, depression, heart disease, and early death. However, these are not inevitable outcomes - resilience and healing are possible.`
    },
    {
      id: 2,
      title: "ADHD Self-Report Scale",
      description: "Adult ADHD screening questionnaire",
      category: "Assessment",
      icon: <Brain className="h-5 w-5" />,
      content: `ADHD SELF-REPORT SCALE (ASRS-v1.1) SYMPTOM CHECKLIST

Instructions: The questions below ask about symptoms you may have experienced. For each question, please circle the number that best describes how you have felt and conducted yourself over the past 6 months.

Never = 0, Rarely = 1, Sometimes = 2, Often = 3, Very Often = 4

PART A:
1. How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done? 0 1 2 3 4

2. How often do you have difficulty getting things in order when you have to do a task that requires organization? 0 1 2 3 4

3. How often do you have problems remembering appointments or obligations? 0 1 2 3 4

4. When you have a task that requires a lot of thought, how often do you avoid or delay getting started? 0 1 2 3 4

5. How often do you fidget or squirm with your hands or feet when you have to sit down for a long time? 0 1 2 3 4

6. How often do you feel overly active and compelled to do things, like you were driven by a motor? 0 1 2 3 4

PART B:
7. How often do you make careless mistakes when you have to work on a boring or difficult project? 0 1 2 3 4

8. How often do you have difficulty keeping your attention when you are doing boring or repetitive work? 0 1 2 3 4

9. How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly? 0 1 2 3 4

SCORING:
Part A: If four or more marks appear in the darkly shaded boxes within Part A, consider asking for an ADHD assessment.
Part B: If two or more marks appear in the darkly shaded boxes within Part B, consider asking for an ADHD assessment.`
    },
    {
      id: 3,
      title: "Beck Depression Inventory",
      description: "Depression assessment questionnaire",
      category: "Assessment", 
      icon: <Heart className="h-5 w-5" />,
      content: `BECK DEPRESSION INVENTORY (BDI-II)

Instructions: This questionnaire consists of 21 groups of statements. Please read each group of statements carefully, and then pick out the one statement in each group that best describes the way you have been feeling during the past two weeks, including today.

1. SADNESS
0 I do not feel sad
1 I feel sad much of the time
2 I am sad all the time
3 I am so sad or unhappy that I can't stand it

2. PESSIMISM
0 I am not discouraged about my future
1 I feel more discouraged about my future than I used to be
2 I do not expect things to work out for me
3 I feel my future is hopeless and will only get worse

3. PAST FAILURE
0 I do not feel like a failure
1 I have failed more than I should have
2 As I look back, I see a lot of failures
3 I feel I am a total failure as a person

4. LOSS OF PLEASURE
0 I get as much pleasure as I ever did from the things I enjoy
1 I don't enjoy things as much as I used to
2 I get very little pleasure from the things I used to enjoy
3 I can't get any pleasure from the things I used to enjoy

5. GUILTY FEELINGS
0 I don't feel particularly guilty
1 I feel guilty over many things I have done or should have done
2 I feel quite guilty most of the time
3 I feel guilty all of the time

SCORING:
0-13: Minimal depression
14-19: Mild depression
20-28: Moderate depression
29-63: Severe depression

Note: This is a screening tool only. Professional evaluation is recommended for scores of 14 or higher.`
    }
  ];

  const copingSkillsForms = [
    {
      id: 4,
      title: "Understanding Triggers",
      description: "Identifying and managing emotional triggers",
      category: "Coping",
      icon: <Brain className="h-5 w-5" />,
      content: `UNDERSTANDING TRIGGERS WORKSHEET

What is a Trigger?
A trigger is anything that causes distress and prompts unhealthy coping behaviors. Triggers can be internal (thoughts, feelings, sensations) or external (people, places, situations).

IDENTIFYING YOUR TRIGGERS

1. EMOTIONAL TRIGGERS
List situations that cause strong emotional reactions:
• ________________________________
• ________________________________
• ________________________________

2. ENVIRONMENTAL TRIGGERS  
List places or settings that affect your mood:
• ________________________________
• ________________________________
• ________________________________

3. RELATIONSHIP TRIGGERS
List people or relationship dynamics that cause stress:
• ________________________________
• ________________________________
• ________________________________

4. PHYSICAL TRIGGERS
List physical sensations or conditions that affect you:
• ________________________________
• ________________________________
• ________________________________

TRIGGER MANAGEMENT STRATEGIES

When you notice a trigger:
1. PAUSE - Take a deep breath and acknowledge what you're feeling
2. IDENTIFY - Name the trigger and your emotional response
3. CHOOSE - Select a healthy coping strategy
4. ACT - Implement your chosen strategy
5. REFLECT - Evaluate how well the strategy worked

HEALTHY COPING STRATEGIES:
• Deep breathing exercises
• Progressive muscle relaxation
• Mindfulness meditation
• Physical exercise
• Journaling
• Talking to a trusted friend
• Engaging in a hobby
• Listening to music
• Taking a warm bath
• Going for a walk in nature

Remember: You cannot always control your triggers, but you can control your response to them.`
    },
    {
      id: 5,
      title: "Defense Mechanisms Worksheet",
      description: "Understanding psychological defense mechanisms",
      category: "Coping",
      icon: <Shield className="h-5 w-5" />,
      content: `DEFENSE MECHANISMS WORKSHEET

What are Defense Mechanisms?
Defense mechanisms are unconscious psychological strategies that protect us from difficult thoughts, feelings, or memories. While they can be helpful in the short term, overuse can prevent growth and healthy relationships.

COMMON DEFENSE MECHANISMS:

1. DENIAL - Refusing to accept reality
Example: "I don't have a drinking problem"

2. PROJECTION - Attributing your feelings to others  
Example: "You're the one who's angry, not me"

3. RATIONALIZATION - Making excuses to justify behavior
Example: "I had to lie because they wouldn't understand"

4. DISPLACEMENT - Redirecting emotions to a safer target
Example: Yelling at family after a bad day at work

5. REGRESSION - Reverting to childlike behaviors
Example: Throwing tantrums when stressed

6. SUBLIMATION - Channeling negative emotions into positive activities
Example: Using anger as motivation to exercise

REFLECTION EXERCISE:

1. Which defense mechanisms do you use most often?
_________________________________________________

2. In what situations do you typically use them?
_________________________________________________

3. How do these mechanisms help you?
_________________________________________________

4. How might they be hurting your relationships or growth?
_________________________________________________

5. What healthier alternatives could you try?
_________________________________________________

DEVELOPING HEALTHIER RESPONSES:

Instead of defense mechanisms, try:
• Acknowledge your true feelings
• Communicate directly and honestly
• Take responsibility for your actions
• Practice self-compassion
• Seek support when needed
• Use mindfulness to stay present

Remember: The goal isn't to eliminate all defense mechanisms, but to become aware of them and choose healthier responses when possible.`
    }
  ];

  const allForms = [...assessmentForms, ...copingSkillsForms];

  const FormCard = ({ form }: { form: any }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedForm(form)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            {form.icon}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{form.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{form.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-center">
          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
            {form.category}
          </span>
          <Button size="sm" variant="outline">
            View Form
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const printForm = (form: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${form.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
              .header { text-align: center; margin-bottom: 30px; }
              .content { white-space: pre-line; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${form.title}</h1>
              <p><strong>Child Mental Haven - Where Young Minds Evolve</strong></p>
              <p>Muchai Drive Off Ngong Road, P.O Box 41622-00100</p>
              <p>Tel: 254746170159 | Email: info@childmentalhaven.org</p>
            </div>
            <div class="content">${form.content}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (selectedForm) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedForm(null)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </Button>
        </div>

        <Card>
          <CardHeader className="border-b">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{selectedForm.title}</CardTitle>
                <p className="text-gray-600 mt-2">{selectedForm.description}</p>
              </div>
              <Button onClick={() => printForm(selectedForm)}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="whitespace-pre-line text-sm leading-relaxed">
              {selectedForm.content}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Therapy Assessment Forms</h1>
          <p className="text-gray-600">Professional mental health assessment tools and therapeutic resources</p>
        </div>
        <Button variant="outline" onClick={() => setLocation("/therapy")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Therapy
        </Button>
      </div>

      <Tabs defaultValue="assessments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assessments">Assessment Forms</TabsTrigger>
          <TabsTrigger value="coping">Coping Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessmentForms.map((form) => (
              <FormCard key={form.id} form={form} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coping" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {copingSkillsForms.map((form) => (
              <FormCard key={form.id} form={form} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TherapyForms;