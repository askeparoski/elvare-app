export const typeResolverQuestions = {
    Gut: [
      {
        prompt: "In a group project I naturally…",
        options: [
          { text: "Take charge and push for results", type: "8" },
          { text: "Keep everyone calm and cooperating", type: "9" },
          { text: "Set standards and make sure rules are followed", type: "1" }
        ]
      },
      {
        prompt: "When something blocks my plans…",
        options: [
          { text: "Double-down and power through", type: "8" },
          { text: "Wait, adapt, and look for an easy compromise", type: "9" },
          { text: "Analyze the mistake and correct it", type: "1" }
        ]
      },
      {
        prompt: "The compliment that lands best is…",
        options: [
          { text: "“You’re fearless”", type: "8" },
          { text: "“You make things feel peaceful”", type: "9" },
          { text: "“You’ve done it exactly right”", type: "1" }
        ]
      },
      // Tiebreaker
      {
        prompt: "Conflict makes me feel…",
        options: [
          { text: "Energized to confront it", type: "8" },
          { text: "Uncomfortable, wish it would fade", type: "9" },
          { text: "Compelled to restore order", type: "1" }
        ],
        tiebreaker: true
      }
    ],
    Heart: [
      {
        prompt: "Friends rely on me mainly to…",
        options: [
          { text: "Offer care and support", type: "2" },
          { text: "Get things done and inspire", type: "3" },
          { text: "Bring depth and creative flair", type: "4" }
        ]
      },
      {
        prompt: "Failure stings because…",
        options: [
          { text: "I let people down", type: "2" },
          { text: "it dents my image of success", type: "3" },
          { text: "it proves I’m not special", type: "4" }
        ]
      },
      {
        prompt: "Receiving praise, I secretly think…",
        options: [
          { text: "“I’m glad I could help”", type: "2" },
          { text: "“Yes, I earned that”", type: "3" },
          { text: "“Do they really see the real me?”", type: "4" }
        ]
      },
      // Tiebreaker
      {
        prompt: "My hidden fear is…",
        options: [
          { text: "Being unneeded", type: "2" },
          { text: "Being insignificant", type: "3" },
          { text: "Being ordinary", type: "4" }
        ],
        tiebreaker: true
      }
    ],
    Head: [
      {
        prompt: "Faced with uncertainty, I first…",
        options: [
          { text: "Research quietly on my own", type: "5" },
          { text: "Look for trusted guidance", type: "6" },
          { text: "Jump in and improvise", type: "7" }
        ]
      },
      {
        prompt: "My comfort zone is…",
        options: [
          { text: "Privacy and expertise", type: "5" },
          { text: "Clear rules and loyalty", type: "6" },
          { text: "Variety and new experiences", type: "7" }
        ]
      },
      {
        prompt: "Biggest drain on me is…",
        options: [
          { text: "People demanding too much time", type: "5" },
          { text: "Feeling I can’t rely on others", type: "6" },
          { text: "Boredom or limitation", type: "7" }
        ]
      },
      // Tiebreaker
      {
        prompt: "Security comes from…",
        options: [
          { text: "Mastering knowledge", type: "5" },
          { text: "Strong alliances", type: "6" },
          { text: "Keeping options open", type: "7" }
        ],
        tiebreaker: true
      }
    ]
  };