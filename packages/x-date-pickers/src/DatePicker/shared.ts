import * as React from 'react';
import { useThemeProps } from '@mui/material/styles';
import { ParseableDate } from '../internals/models/parseableDate';
import { OverrideParseableDateProps } from '../internals/hooks/date-helpers-hooks';
import { useDefaultDates, useUtils } from '../internals/hooks/useUtils';
import { CalendarPickerView, MuiPickersAdapter } from '../internals/models';
import { ExportedCalendarPickerProps } from '../CalendarPicker/CalendarPicker';
import { DateValidationError } from '../internals/hooks/validation/useDateValidation';
import { ValidationProps } from '../internals/hooks/validation/useValidation';
import { ExportedDateInputProps } from '../internals/components/PureDateInput';
import { BasePickerProps } from '../internals/models/props/basePickerProps';
import { BaseToolbarProps } from '../internals/models/props/baseToolbarProps';

export interface BaseDatePickerProps<TDate>
  extends ExportedCalendarPickerProps<TDate>,
    BasePickerProps<ParseableDate<TDate>, TDate | null>,
    ValidationProps<DateValidationError, ParseableDate<TDate>>,
    ExportedDateInputProps<ParseableDate<TDate>, TDate | null> {
  /**
   * The components used for each slot.
   * Either a string to use a HTML element or a component.
   * @default {}
   */
  components?: OverrideParseableDateProps<
    TDate,
    ExportedCalendarPickerProps<TDate>,
    'minDate' | 'maxDate'
  >['components'] &
    ExportedDateInputProps<ParseableDate<TDate>, TDate | null>['components'];
  /**
   * Callback fired on view change.
   * @param {CalendarPickerView} view The new view.
   */
  onViewChange?: (view: CalendarPickerView) => void;
  /**
   * First view to show.
   */
  openTo?: CalendarPickerView;
  /**
   * Component that will replace default toolbar renderer.
   * @default DatePickerToolbar
   */
  ToolbarComponent?: React.JSXElementConstructor<BaseToolbarProps<TDate | null>>;
  /**
   * Mobile picker title, displaying in the toolbar.
   * @default 'Select date'
   */
  toolbarTitle?: React.ReactNode;
  /**
   * Array of views to show.
   */
  views?: readonly CalendarPickerView[];
}

export const isYearOnlyView = (
  views: readonly CalendarPickerView[],
): views is ReadonlyArray<'year'> => views.length === 1 && views[0] === 'year';

export const isYearAndMonthViews = (
  views: readonly CalendarPickerView[],
): views is ReadonlyArray<'month' | 'year'> =>
  views.length === 2 && views.indexOf('month') !== -1 && views.indexOf('year') !== -1;

const getFormatAndMaskByViews = <TDate>(
  views: readonly CalendarPickerView[],
  utils: MuiPickersAdapter<TDate>,
): { disableMaskedInput?: boolean; inputFormat: string; mask?: string } => {
  if (isYearOnlyView(views)) {
    return {
      mask: '____',
      inputFormat: utils.formats.year,
    };
  }

  if (isYearAndMonthViews(views)) {
    return {
      disableMaskedInput: true,
      inputFormat: utils.formats.monthAndYear,
    };
  }

  return {
    mask: '__/__/____',
    inputFormat: utils.formats.keyboardDate,
  };
};

export type DefaultizedProps<Props> = Props & { inputFormat: string };

export function useDatePickerDefaultizedProps<TDate, Props extends BaseDatePickerProps<TDate>>(
  {
    openTo = 'day',
    views = ['year', 'day'],
    minDate: minDateProp,
    maxDate: maxDateProp,
    ...other
  }: Props,
  name: string,
): DefaultizedProps<Props> & Required<Pick<BaseDatePickerProps<unknown>, 'openTo' | 'views'>> {
  const utils = useUtils<TDate>();
  const defaultDates = useDefaultDates();
  const minDate = minDateProp ?? defaultDates.minDate;
  const maxDate = maxDateProp ?? defaultDates.maxDate;

  // This is technically unsound if the type parameters appear in optional props.
  // Optional props can be filled by `useThemeProps` with types that don't match the type parameters.
  return useThemeProps({
    props: {
      views,
      openTo,
      minDate,
      maxDate,
      ...getFormatAndMaskByViews(views, utils),
      ...(other as Props),
    },
    name,
  });
}
