import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = [
  { id: "daniel", name: "Daniel Park", email: "daniel@ajaia.test", color: "#355e4b" },
  { id: "maya", name: "Maya Singh", email: "maya@ajaia.test", color: "#b46a55" },
  { id: "elena", name: "Elena Rossi", email: "elena@ajaia.test", color: "#6d8fc4" }
];

function starterContent(title, paragraph, bullets) {
  return {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: title }]
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: paragraph }]
      },
      {
        type: "bulletList",
        content: bullets.map((text) => ({
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text }] }]
        }))
      }
    ]
  };
}

async function main() {
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user
    });
  }

  const documents = [
    {
      id: "seed-q3-strategy",
      title: "Q3 Product Strategy",
      ownerId: "daniel",
      plainText: "A focused operating memo for the next quarter.",
      contentJson: JSON.stringify(
        starterContent("Q3 Product Strategy", "Align the product team around a small set of deliberate bets.", [
          "Prioritize the two customer problems with the clearest evidence.",
          "Write down decisions and owners before the weekly planning review.",
          "Measure progress with one outcome metric for each bet."
        ])
      )
    },
    {
      id: "seed-research-synthesis",
      title: "Customer Research Synthesis",
      ownerId: "maya",
      plainText: "Patterns from customer interviews and workflow observations.",
      contentJson: JSON.stringify(
        starterContent("Customer Research Synthesis", "The strongest signal is a need for clearer decision context between teams.", [
          "Customers value concise written handoffs over additional status meetings.",
          "Decision rationale is often lost after a project moves into delivery.",
          "A shared document can keep the team aligned on the next experiment."
        ])
      )
    },
    {
      id: "seed-launch-readiness",
      title: "Launch Readiness Brief",
      ownerId: "daniel",
      plainText: "A short checklist for a focused product launch.",
      contentJson: JSON.stringify(
        starterContent("Launch Readiness Brief", "Use this brief to make launch responsibilities visible before the final review.", [
          "[ ] Confirm the customer-facing release note.",
          "[ ] Assign an owner for launch-day support.",
          "[ ] Capture the first-week success metric."
        ])
      )
    }
  ];

  for (const document of documents) {
    await prisma.document.upsert({
      where: { id: document.id },
      update: document,
      create: document
    });
  }

  await prisma.documentShare.upsert({
    where: { documentId_userId: { documentId: "seed-research-synthesis", userId: "daniel" } },
    update: { role: "EDITOR" },
    create: { documentId: "seed-research-synthesis", userId: "daniel", role: "EDITOR" }
  });

  await prisma.documentShare.upsert({
    where: { documentId_userId: { documentId: "seed-launch-readiness", userId: "maya" } },
    update: { role: "VIEWER" },
    create: { documentId: "seed-launch-readiness", userId: "maya", role: "VIEWER" }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
