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

import React from "react";
import { createUseStyles } from "react-jss";
import { GenericResultItem } from "@openk9/http-api";
import { ThemeType } from "../theme";

const useStyles = createUseStyles((theme: ThemeType) => ({
  entities: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacingUnit,
  },
  token: {
    padding: [theme.spacingUnit, theme.spacingUnit * 2],
    borderRadius: theme.borderRadius,
    backgroundColor: theme.digitalLakePrimary,
    color: "white",
  },
}));

export function EntityDisplay({
  type,
  id,
  label,
}: {
  type: string;
  id: number;
  label?: string;
}) {
  const classes = useStyles();
  return (
    <div className={classes.token}>
      <strong>{type.toUpperCase().substring(0, 3)} </strong>
      {label ? label : id}
    </div>
  );
}

export function EntityListDisplay({
  entities,
  entityLabels,
  ignoreTypes,
  ...rest
}: {
  entities: GenericResultItem["source"]["entities"];
  ignoreTypes?: string[];
  entityLabels?: [number, string][];
} & React.HTMLAttributes<HTMLDivElement>) {
  const classes = useStyles();

  const entityList = Object.entries(entities || {})
    .filter(([key]) => !ignoreTypes || ignoreTypes.indexOf(key) === -1)
    .flatMap(([key, value]) =>
      value
        ? value.map((v) => ({
            type: key,
            label: entityLabels && entityLabels.find(([id]) => id === v.id),
            ...v,
          }))
        : [],
    );

  return (
    <div className={classes.entities} {...rest}>
      {entityList.map((e) => (
        <EntityDisplay
          type={e.type}
          id={e.id}
          key={e.id}
          label={e.label && e.label[1]}
        />
      ))}
    </div>
  );
}
