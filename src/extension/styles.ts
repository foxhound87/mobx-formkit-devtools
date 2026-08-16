import { css } from '@emotion/css';
import theme from '../react/styles/_.theme';

const fontStack =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export default {
  root: css({
    fontFamily: fontStack,
    background: theme.base00,
    color: theme.base05,
    minHeight: '100vh',
    fontSize: '12px',
  }),

  header: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    background: theme.base01,
    borderBottom: `1px solid ${theme.base02}`,
  }),

  brand: css({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    '& > span:first-child': {
      color: theme.base0D,
    },
    '& > span:last-child': {
      color: theme.base09,
    },
  }),

  status: css({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: theme.base04,
  }),

  dot: css({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: theme.base08,
    '&[data-on="true"]': {
      background: theme.base0B,
    },
  }),

  body: css({
    padding: '10px 12px 20px',
  }),

  empty: css({
    padding: '24px 12px',
    textAlign: 'center',
    color: theme.base04,
  }),

  toolbar: css({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '10px',
  }),

  select: css({
    flex: '1 1 160px',
    minWidth: '140px',
    fontSize: '12px',
    padding: '6px 8px',
    background: theme.base02,
    color: theme.base06,
    border: `1px solid ${theme.base03}`,
    borderRadius: '4px',
    cursor: 'pointer',
    ':focus': {
      outline: 'none',
      borderColor: theme.base0D,
    },
  }),

  controls: css({
    display: 'flex',
    gap: '4px',
  }),

  button: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    padding: '5px 8px',
    background: theme.base02,
    color: theme.base06,
    border: `1px solid ${theme.base03}`,
    borderRadius: '4px',
    cursor: 'pointer',
    ':hover': {
      background: theme.base03,
      color: theme.base07,
    },
    ':disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  }),

  section: css({
    border: `1px solid ${theme.base02}`,
    borderRadius: '6px',
    marginBottom: '10px',
    overflow: 'hidden',
  }),

  sectionHeading: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: theme.base01,
    color: theme.base06,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontSize: '11px',
    cursor: 'pointer',
    userSelect: 'none',
    ':hover': {
      background: theme.base02,
    },
  }),

  sectionLabel: css({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  }),

  chevron: css({
    display: 'flex',
    alignItems: 'center',
    transition: 'transform 150ms ease',
    '&[data-collapsed="true"]': {
      transform: 'rotate(-90deg)',
    },
  }),

  content: css({
    padding: '10px 12px',
    overflowX: 'auto',
  }),

  hint: css({
    color: theme.base04,
    fontSize: '11px',
    padding: '4px 0',
  }),

  optionSearch: css({
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '12px',
    padding: '6px 8px',
    marginBottom: '10px',
    background: theme.base02,
    color: theme.base06,
    border: `1px solid ${theme.base03}`,
    borderRadius: '4px',
    ':focus': {
      outline: 'none',
      borderColor: theme.base0D,
    },
    '::placeholder': {
      color: theme.base04,
    },
  }),

  optionGroup: css({
    marginBottom: '8px',
  }),

  optionGroupTitle: css({
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    color: theme.base04,
    margin: '8px 0 2px',
  }),

  optionsList: css({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1px 12px',
    '@media (max-width: 360px)': {
      gridTemplateColumns: '1fr',
    },
  }),

  optionLabel: css({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: theme.base05,
    cursor: 'pointer',
    padding: '2px 0',
    ':hover': {
      color: theme.base0B,
    },
  }),

  optionInput: css({
    margin: 0,
    cursor: 'pointer',
  }),
};
