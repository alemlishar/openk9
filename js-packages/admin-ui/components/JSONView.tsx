/*
 * Copyright (c) 2020-present SMC Treviso s.r.l. All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { createUseStyles } from "react-jss";
import { ThemeType } from "@openk9/search-ui-components";

const useStyles = createUseStyles((theme: ThemeType) => ({
  json: {
    marginTop: "0.2rem",
    backgroundColor: theme.digitalLakeMainL2,
    color: "white",
    padding: theme.spacingUnit * 2,
    borderRadius: theme.borderRadius,
  },
}));

export function JSONView({ jsonString }: { jsonString: string }) {
  const classes = useStyles();
  return (
    <pre className={classes.json}>
      {JSON.stringify(JSON.parse(jsonString), null, 4)}
    </pre>
  );
}