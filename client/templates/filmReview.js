Template.filmReview.helpers({
    options: function() {
        return {
            defaultView: 'month',
            firstDay: 1,
            defaultDate: '2017-5-1',
            header: {
                left: '',
                center: '',
                right: 'basicWeek month'
            },
            footer: {
                left: '',
                center: '',
                right: ''
            },
            events: [
                {
                    title: 'Film Showing',
                    start: '2017-5-1T10:00:00',
                    end: '2017-5-1-T12:00:00'
                    // rendering: 'background'
                }
            ],
            dayClick: function(date, jsEvent, view) {
                alert('clicked on: ' + date.format());
                $(this).css('background-color', 'teal');
            }
        }
    }
});