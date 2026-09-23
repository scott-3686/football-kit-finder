export const CLUB_METADATA = {
  'Aberdeen': {
    country: 'Scotland',
    league: 'Scottish Premiership'
  },

  'Dundee United': {
    country: 'Scotland',
    league: 'Scottish Premiership'
  },

  'St Mirren': {
    country: 'Scotland',
    league: 'Scottish Premiership'
  },

  'Livingston': {
    country: 'Scotland',
    league: 'Scottish Championship'
  }
};


export function getClubMetadata(
  club
) {
  return (
    CLUB_METADATA[club] || {
      country: 'Unknown',
      league: 'Unknown'
    }
  );
}