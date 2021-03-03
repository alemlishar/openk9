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

package com.openk9.search.client.api;

import org.elasticsearch.action.ActionListener;
import reactor.core.publisher.MonoSink;

public class ReactorActionListener<T>
	implements ActionListener<T> {

	public ReactorActionListener(MonoSink<T> sink) {
		_sink = sink;
	}

	@Override
	public void onResponse(T t) {
		_sink.success(t);
	}

	@Override
	public void onFailure(Exception e) {
		_sink.error(e);
	}

	private final MonoSink<T> _sink;

}