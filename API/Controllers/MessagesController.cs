using GiupViecAPI.Data;
using GiupViecAPI.Services.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;


namespace GiupViecAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly IMessageService _messageService;

        public MessagesController(IMessageService messageService)
        {
            _messageService = messageService;
        }

        [HttpGet("History/{bookingId}")]
        public async Task<IActionResult> GetHistory(int bookingId)
        {
            // Thay đổi: Gọi qua Service
            var messages = await _messageService.GetHistoryAsync(bookingId);
            return Ok(messages);
        }
    }
}
